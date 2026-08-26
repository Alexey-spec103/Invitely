-- Phase 8a: generalize `events` from a wedding-only, one-per-account model to
-- a multi-event-type, multi-event-per-account model.
--
-- 1. `event_type` replaces the implicit "always a wedding" assumption. The
--    check constraint mirrors the id list in lib/eventTypes.ts exactly --
--    keep the two in sync if the type list ever changes.
-- 2. `title`/`subtitle_names` replace `couple_name_1`/`couple_name_2` as the
--    canonical display-name model: `title` is the single composed display
--    string (e.g. "Anna & Peter", "Sarah's 30th Birthday"), `subtitle_names`
--    keeps the raw 1-2 entered names for hero variants that render them
--    separately (e.g. two monogram letters). Backfilled from the old columns
--    before those columns are dropped -- this is a real redesign (the
--    two-column model is wrong for 10 of the 12 event types), not a shim.
-- 3. Dropping `events_owner_id_key` (added in 20260813100000) lets one
--    account hold multiple events -- the user wants a couple who used
--    Invitely for their wedding to be able to come back and use it again
--    for a different occasion later.

alter table public.events
  add column event_type text not null default 'wedding',
  add column title text,
  add column subtitle_names text[];

alter table public.events
  add constraint events_event_type_check check (event_type in (
    'wedding', 'anniversary', 'engagement', 'birthday', 'baby_shower',
    'kids_party', 'quinceanera', 'graduation', 'corporate', 'holiday',
    'retirement', 'other'
  ));

update public.events
set
  title = couple_name_1 || ' & ' || couple_name_2,
  subtitle_names = array[couple_name_1, couple_name_2]
where title is null;

alter table public.events
  alter column title set not null,
  drop column couple_name_1,
  drop column couple_name_2;

alter table public.events
  drop constraint events_owner_id_key;
