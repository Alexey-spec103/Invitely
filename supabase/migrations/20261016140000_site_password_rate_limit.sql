-- Security audit (2026-10-16): verify_site_password (20260910120000) checks
-- a guest-entered password against the event's hash with no rate limit at
-- all -- an anonymous, internet-facing RPC any script can call directly.
-- Site passwords are short, human-chosen strings (unlike invite_code, a
-- random uuid lookup_guest_by_invite_code's own comment already notes is
-- "infeasible" to guess) -- exactly the shape of secret brute-forcing
-- actually works against. Notably, this exact RPC was already named as an
-- *existing* precedent for guarded anon-callable writes in
-- 20261012130000_rsvp_rate_limit.sql's own comment ("matching every other
-- anon-callable guarded write in this app (find_or_create_self_service_guest,
-- verify_site_password, etc.)") -- that assumption was wrong; this closes
-- the actual gap.
--
-- Same log-table + SECURITY DEFINER RPC shape as
-- check_and_log_rsvp_submission, same 5-per-10-minutes threshold (already
-- proven as a reasonable real-guest-vs-bot tradeoff in this codebase) --
-- generous enough for someone re-typing their own password a couple of
-- times, tight enough that a scripted guesser never gets more than a
-- handful of attempts per window regardless of how the password's own
-- entropy compares.
create table if not exists public.site_password_attempt_log (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  ip_address text not null,
  attempted_at timestamptz not null default now()
);

create index if not exists site_password_attempt_log_event_ip_time_idx
  on public.site_password_attempt_log (event_id, ip_address, attempted_at desc);

alter table public.site_password_attempt_log enable row level security;
-- No policies at all, same reasoning as rsvp_submission_log: RLS enabled
-- with zero grants denies every direct access regardless of role; the RPC
-- below is the only way in (SECURITY DEFINER bypasses RLS for its own
-- writes/reads against this table).

create or replace function public.check_and_log_site_password_attempt(p_event_id uuid, p_ip_address text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count integer;
begin
  select count(*) into recent_count
  from public.site_password_attempt_log
  where event_id = p_event_id
    and ip_address = p_ip_address
    and attempted_at > now() - interval '10 minutes';

  insert into public.site_password_attempt_log (event_id, ip_address) values (p_event_id, p_ip_address);

  return recent_count < 5;
end;
$$;

grant execute on function public.check_and_log_site_password_attempt(uuid, text) to anon, authenticated;

notify pgrst, 'reload schema';
