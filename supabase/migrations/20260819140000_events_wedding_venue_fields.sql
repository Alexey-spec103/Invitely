-- Unified "wedding data" source (Phase 15): names and event_date already
-- live on the events row, and it turns out venue_name/venue_address do too
-- (pre-existing columns, unused by any app code so far, older than this
-- migration history -- see database.types.ts). Only venue_city is actually
-- missing. Adding it lets a single hub-screen form own names/date/venue as
-- one shared source that Hero, Map's default venue, and the paper PDF can
-- all read from.

alter table public.events
  add column venue_city text;
