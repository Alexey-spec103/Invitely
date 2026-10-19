-- Form-strategy audit (2026-10-19): app/onboarding/actions.ts's
-- completeOnboarding() had zero abuse-resistance -- it only requires an
-- authenticated session, and per OnboardingWizard.tsx's own comment "a real
-- (anonymous, if they had no session at all) session always exists by the
-- time this renders" (lib/supabase/proxy.ts auto-provisions one). An
-- anonymous session costs an attacker nothing to obtain, so a scripted loop
-- could call this endlessly, each call creating a real `events` row (plus
-- its cascading site_config/theme_history rows via createEvent) -- a
-- resource-exhaustion vector, not content spam, so it needs its own check
-- rather than reusing the RSVP/site-password rate limits (both scoped to
-- an existing event_id, which doesn't exist yet here).
--
-- Same log-table + SECURITY DEFINER RPC shape and 5-per-10-minutes
-- threshold as check_and_log_rsvp_submission (20261012130000) and
-- check_and_log_site_password_attempt (20261016140000) -- already proven
-- in this codebase as generous enough for a real person retrying a few
-- times, tight enough to block an unattended script. Keyed by ip_address
-- alone, not event_id (there's no event yet) and not user_id alone (a
-- disposable anonymous session is trivial to rotate for a fresh user_id,
-- so ip is the one signal that actually survives that).
create table if not exists public.event_creation_log (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null,
  created_at timestamptz not null default now()
);

create index if not exists event_creation_log_ip_time_idx
  on public.event_creation_log (ip_address, created_at desc);

alter table public.event_creation_log enable row level security;
-- No policies, same reasoning as the two precedents above: RLS enabled
-- with zero grants denies every direct access regardless of role; the RPC
-- below (SECURITY DEFINER, bypasses RLS for its own reads/writes) is the
-- only way in.

create or replace function public.check_and_log_event_creation(p_ip_address text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count integer;
begin
  select count(*) into recent_count
  from public.event_creation_log
  where ip_address = p_ip_address
    and created_at > now() - interval '10 minutes';

  insert into public.event_creation_log (ip_address) values (p_ip_address);

  return recent_count < 5;
end;
$$;

grant execute on function public.check_and_log_event_creation(text) to anon, authenticated;

notify pgrst, 'reload schema';
