-- Fix for 20260910120000_events_site_password.sql: the column-level REVOKE
-- was applied (confirmed no SQL error), but PostgREST caches the database's
-- schema/privilege info at startup and doesn't automatically notice a
-- manually-run REVOKE -- confirmed live: `site_password_hash` was still
-- readable via the anon key's REST API after the revoke. Re-issuing the
-- revoke (idempotent, harmless if already in effect) and telling PostgREST
-- to reload its schema cache is the documented fix.

revoke select (site_password_hash) on public.events from anon, authenticated;

notify pgrst, 'reload schema';
