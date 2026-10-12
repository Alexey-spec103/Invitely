-- form-strategy audit (2026-10-12): submitRsvp (app/e/[slug]/actions.ts) is
-- an unauthenticated, internet-facing write path. It already has a
-- honeypot field and a "faster than any human" timing check, but both are
-- trivial for a scripted bot that waits a couple seconds between requests
-- to sail through -- there was no rate limit behind either check. A
-- persistent scraper could spam a host's inbox (every RSVP now triggers a
-- real email, see the branded-email work from this same session) and
-- guest list with no real resistance.
--
-- A small log table + a single SECURITY DEFINER RPC, matching every other
-- anon-callable guarded write in this app (find_or_create_self_service_guest,
-- verify_site_password, etc.) rather than a service-role client or an
-- open RLS policy -- the RPC is the only way to touch this table at all,
-- so there's nothing to lock down separately.
create table if not exists public.rsvp_submission_log (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  ip_address text not null,
  submitted_at timestamptz not null default now()
);

create index if not exists rsvp_submission_log_event_ip_time_idx
  on public.rsvp_submission_log (event_id, ip_address, submitted_at desc);

alter table public.rsvp_submission_log enable row level security;
-- No policies at all: RLS enabled with zero grants denies every direct
-- access (anon, authenticated, even via REST) -- the RPC below is the only
-- way in, since SECURITY DEFINER runs with the function owner's privileges,
-- bypassing RLS on this table entirely regardless of the caller's own role.

-- Returns true if this ip_address may submit another RSVP for this event
-- right now (and logs the attempt), false if it's over the limit --
-- callers must still succeed/fail the real rsvp_responses write themselves;
-- this only gates the attempt. Limit: 5 submissions per IP per event per
-- 10 minutes -- generous enough for a guest retrying a typo or correcting
-- their RSVP a few times, tight enough to stop a scripted loop. Logs the
-- attempt regardless of outcome (including the one that trips the limit),
-- so a sustained bot can't "reset" the window by probing just under the
-- threshold forever.
create or replace function public.check_and_log_rsvp_submission(p_event_id uuid, p_ip_address text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count integer;
begin
  select count(*) into recent_count
  from public.rsvp_submission_log
  where event_id = p_event_id
    and ip_address = p_ip_address
    and submitted_at > now() - interval '10 minutes';

  insert into public.rsvp_submission_log (event_id, ip_address) values (p_event_id, p_ip_address);

  return recent_count < 5;
end;
$$;

grant execute on function public.check_and_log_rsvp_submission(uuid, text) to anon, authenticated;

notify pgrst, 'reload schema';
