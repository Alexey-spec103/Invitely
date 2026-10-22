-- security-baseline audit (2026-10-22): lookup_guest_table_by_name
-- (lookupGuestTable in app/e/[slug]/actions.ts) has no rate limit, unlike
-- its siblings submitRsvp and unlockSitePassword -- an anonymous,
-- internet-facing RPC any script can call directly to enumerate guest
-- names/attendance by brute-forcing common names. It only returns
-- {found, table_name, attending} (no contact info, by design), so the
-- blast radius is name/attendance enumeration, not data theft -- but
-- that's still real, and three sibling endpoints already close this exact
-- gap for themselves. Same log-table + SECURITY DEFINER RPC shape as
-- check_and_log_site_password_attempt (20261016140000), same 5-per-10-
-- minutes threshold already proven as a reasonable real-guest-vs-bot
-- tradeoff in this codebase.
create table if not exists public.banquet_lookup_attempt_log (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  ip_address text not null,
  attempted_at timestamptz not null default now()
);

create index if not exists banquet_lookup_attempt_log_event_ip_time_idx
  on public.banquet_lookup_attempt_log (event_id, ip_address, attempted_at desc);

alter table public.banquet_lookup_attempt_log enable row level security;
-- No policies at all, same reasoning as site_password_attempt_log: RLS
-- enabled with zero grants denies every direct access regardless of role;
-- the RPC below is the only way in (SECURITY DEFINER bypasses RLS for its
-- own writes/reads against this table).

create or replace function public.check_and_log_banquet_lookup_attempt(p_event_id uuid, p_ip_address text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count integer;
begin
  select count(*) into recent_count
  from public.banquet_lookup_attempt_log
  where event_id = p_event_id
    and ip_address = p_ip_address
    and attempted_at > now() - interval '10 minutes';

  insert into public.banquet_lookup_attempt_log (event_id, ip_address) values (p_event_id, p_ip_address);

  return recent_count < 5;
end;
$$;

grant execute on function public.check_and_log_banquet_lookup_attempt(uuid, text) to anon, authenticated;

notify pgrst, 'reload schema';
