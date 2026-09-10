-- Fix for 20260910120000_events_site_password.sql: confirmed via
-- information_schema.column_privileges that anon/authenticated hold SELECT
-- as a TABLE-level grant on events (Supabase's default setup). A
-- column-level REVOKE has nothing to remove in that case -- Postgres stores
-- table-level and column-level privileges separately, and a table-level
-- grant confers access to every column regardless of an unrelated
-- column-level revoke. The only way to actually block one column is to
-- revoke the table-level SELECT and re-grant it column-by-column, excluding
-- site_password_hash.
--
-- This does not affect INSERT/UPDATE/REFERENCES (untouched, still
-- table-level) or any RLS policy: the "public can read published events" /
-- "owners can read own events" policies only reference status/owner_id,
-- both included below.

revoke select on public.events from anon, authenticated;

grant select (
  id, owner_id, slug, title, subtitle_names, event_type, event_date, event_time,
  venue_name, venue_address, venue_city, venue_lat, venue_lng, plan_id, status,
  default_locale, supported_locales, custom_domain, custom_domain_verification_token,
  custom_domain_verified_at, site_password_enabled, site_password_unlock_token,
  created_at, updated_at
) on public.events to anon, authenticated;

notify pgrst, 'reload schema';
