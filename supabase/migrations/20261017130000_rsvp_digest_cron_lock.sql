-- Follow-up to the RSVP-email audit (2026-10-17): app/api/cron/rsvp-digest/
-- route.ts has no guard against running twice concurrently -- if Vercel
-- ever retries a slow/timed-out cron invocation (or someone manually hits
-- the endpoint while the real cron run is still mid-flight), both
-- executions would loop over the same digest-enabled events at once. Each
-- individual event's own last_digest_sent_at check happens too late to
-- prevent this: both runs read the same "before" value before either one
-- writes it, so a host could get the same digest twice.
--
-- A plain Postgres session advisory lock (pg_try_advisory_lock) won't work
-- here -- Supabase's JS client talks to PostgREST over HTTP, not a held
-- session connection, so a lock taken in one .rpc() call doesn't survive to
-- the next. A real row with a lease (an expiry, not a permanent flag) is
-- the fix: self-healing if a run crashes without releasing (the lease just
-- expires), and correct for the actual failure mode this guards against
-- (near-simultaneous duplicate invocations), not "has this ever run
-- before" (that's what last_digest_sent_at already tracks, per-event).
create table if not exists public.cron_locks (
  job_name text primary key,
  locked_until timestamptz not null
);

alter table public.cron_locks enable row level security;
-- No policies, same reasoning as site_password_attempt_log/
-- rsvp_submission_log: RLS with zero grants denies every direct access
-- regardless of role. The two SECURITY DEFINER functions below are the
-- only way in, and both have PUBLIC execute revoked -- only the cron
-- route's service-role client (which Supabase provisions with its own
-- broader access, same assumption every other service-role-only function
-- in this codebase already relies on) can call them.

create or replace function public.try_acquire_cron_lock(p_job_name text, p_lease_seconds integer default 600)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  acquired boolean;
begin
  -- Insert a fresh lock, or steal an expired one -- `where ... locked_until
  -- < now()` makes the UPDATE branch a no-op (and RETURNING produce zero
  -- rows) whenever a still-valid lock is held by someone else, which is
  -- exactly the "someone else is already running this" case this should
  -- report as false.
  insert into public.cron_locks (job_name, locked_until)
  values (p_job_name, now() + make_interval(secs => p_lease_seconds))
  on conflict (job_name) do update
    set locked_until = excluded.locked_until
    where cron_locks.locked_until < now()
  returning true into acquired;

  return coalesce(acquired, false);
end;
$$;

create or replace function public.release_cron_lock(p_job_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.cron_locks where job_name = p_job_name;
end;
$$;

-- Revoking from PUBLIC alone isn't enough here -- verified live that anon
-- could still call this afterward, meaning this project's anon/authenticated
-- roles carry their own direct EXECUTE grant on public-schema functions
-- (almost certainly via an ALTER DEFAULT PRIVILEGES set up once at project
-- provisioning, separate from the PUBLIC pseudo-role), not merely inherited
-- through PUBLIC. Revoke from both roles by name to actually close it.
revoke execute on function public.try_acquire_cron_lock(text, integer) from public, anon, authenticated;
revoke execute on function public.release_cron_lock(text) from public, anon, authenticated;

notify pgrst, 'reload schema';
