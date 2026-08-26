-- Map section now supports multiple venues (e.g. ceremony + reception at
-- different addresses, matching weddingpost.ru's own module list) instead of
-- a single venueName/venueAddress pair. `MapSectionVariantProps` changed from
-- `{ venueName, venueAddress }` to `{ venues: {name, address}[] }`, and the
-- public page spreads `content.map` straight into that component -- so any
-- event saved before this change needs its stored JSON converted, the same
-- way 20260817110000 had to convert `content.hero.coupleNames`. Without this,
-- `EmbedStatic`'s `venues.map(...)` would crash on `undefined` for every
-- pre-existing event with a Map section configured.

update public.site_config
set content = jsonb_set(
  content,
  '{map,venues}',
  jsonb_build_array(
    jsonb_build_object(
      'name', coalesce(content->'map'->'venueName', '""'::jsonb),
      'address', coalesce(content->'map'->'venueAddress', '""'::jsonb)
    )
  )
)
where content->'map' is not null
  and content->'map'->'venues' is null;
