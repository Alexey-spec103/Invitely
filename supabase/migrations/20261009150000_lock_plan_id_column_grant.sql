-- dashboard-audit security pass: app/dashboard/[eventId]/plan/actions.ts's
-- updatePlan() rejects a client-supplied paid planId, but that's only an
-- application-layer check -- the real data-layer defense was missing. The
-- "Owners can update their own events" RLS policy (20260812090000) scopes
-- *rows* (owner_id = auth.uid()) but not *columns*, and Supabase's default
-- table-level UPDATE grant to anon/authenticated covers every column
-- including plan_id. Any authenticated user could call
-- `supabase.from('events').update({ plan_id: 'premium' }).eq('id', theirEventId)`
-- directly against the REST API from a browser console and upgrade their own
-- event for free, completely bypassing Stripe.
--
-- plan_id can't use the same plain column-grant-revoke 20260910150000 used
-- for SELECT on site_password_hash: updatePlan()'s legitimate "downgrade to
-- Free" path (cancelling, no payment involved) also writes plan_id from the
-- *authenticated* client, not a service-role one -- a blanket revoke would
-- break that real feature along with the exploit. A trigger can express the
-- one case a plain grant can't: allow the write only when the new value is
-- the free plan, or the caller is the service role.
-- Not security definer: this only compares NEW/OLD and raises on a bad
-- value, never touches anything the triggering role couldn't already see
-- itself, so running with the caller's own (not elevated) privileges is
-- both correct and the smaller attack surface.
create or replace function public.guard_events_plan_id_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.plan_id is distinct from old.plan_id then
    -- auth.role() is Supabase's standard helper (from the auth schema,
    -- backed by the request's JWT claims) for "which Postgres role is this
    -- request running as" -- 'service_role' for the Stripe webhook/cron
    -- (lib/supabase/service.ts's createServiceClient), 'authenticated' for
    -- every dashboard action. A direct psql/service-role write (no JWT in
    -- scope) reports auth.role() as null, not 'service_role' -- allow that
    -- case too so this never blocks a migration, console, or future
    -- service-side script that isn't going through a Supabase client.
    if new.plan_id <> 'free' and auth.role() is distinct from 'service_role' and auth.role() is not null then
      raise exception 'plan_id can only be upgraded through Stripe checkout';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_events_plan_id_update on public.events;
create trigger guard_events_plan_id_update
  before update on public.events
  for each row
  execute function public.guard_events_plan_id_update();

-- Two more columns, both verified to be written ONLY by a service-role
-- client with no legitimate authenticated-write path at all (unlike
-- plan_id, so a plain column-grant-revoke -- same shape as 20260910150000's
-- own SELECT fix -- is the right tool here, not a trigger):
--   - last_digest_sent_at: only app/api/cron/rsvp-digest/route.ts, via
--     createServiceClient(), gated by the cron route's own bearer-token check.
--   - site_password_hash: only ever written through the set_site_password()
--     RPC (security definer, runs with its own elevated privileges
--     regardless of the caller's column grants) -- no code path updates it
--     via a direct table UPDATE. Narrows the surface for free with no
--     feature impact, not a new finding on its own.
--
-- Not included here, flagged for a separate look rather than folded into
-- this fix: app/dashboard/[eventId]/site/domain-actions.ts's verifyDomain()
-- writes custom_domain_verified_at from the *authenticated* client after
-- its own app-layer DNS TXT-record check -- a different bug shape (a real
-- user's own legitimate write path with an app-layer-only gate, not a
-- "service-role-only" column), so excluding that column here would break
-- the real verification flow, not just a theoretical exploit of it.

revoke update on public.events from anon, authenticated;

grant update (
  id, owner_id, slug, title, subtitle_names, event_type, event_date, event_time,
  venue_name, venue_address, venue_city, venue_lat, venue_lng, status, plan_id,
  default_locale, supported_locales, custom_domain, custom_domain_verification_token,
  custom_domain_verified_at, site_password_enabled, site_password_unlock_token,
  rsvp_email_notifications, rsvp_digest_email, created_at, updated_at
) on public.events to anon, authenticated;

notify pgrst, 'reload schema';
