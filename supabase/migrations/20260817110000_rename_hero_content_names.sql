-- 20260817100000 renamed the `events` table's couple-name columns, but that
-- migration only touched `events` -- it didn't (and structurally couldn't,
-- being a plain column migration) touch the `coupleNames` key still sitting
-- inside every existing `site_config.content->'hero'` JSON blob written by
-- the pre-Phase-8 code. `HeroSectionVariantProps` was renamed
-- `coupleNames: [string, string]` -> `names: string[]`, so any event created
-- before this phase now has hero content the renderer can't read (`names` is
-- undefined), even though the DB migration itself succeeded cleanly --
-- caught live testing the pre-existing `anna-and-peter` test event.

update public.site_config
set content = jsonb_set(
  content #- '{hero,coupleNames}',
  '{hero,names}',
  content->'hero'->'coupleNames'
)
where content->'hero'->'coupleNames' is not null;
