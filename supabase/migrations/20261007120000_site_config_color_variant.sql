-- Lets a host swap in another theme's palette (bg/text/accent) on top of
-- their current theme without switching the theme itself -- only offered in
-- the dashboard for the `modern`/`minimal` categories, whose decorative
-- assets are accent-tinted CSS masks (not fixed-palette illustrations like
-- every other category), so a palette swap can't clash with baked-in art.
-- Nullable, no default: absent means "use the theme's own colors", the
-- behavior every existing event already has.
alter table public.site_config
  add column if not exists color_variant_id text null;

comment on column public.site_config.color_variant_id is
  'Theme id whose vars (bg/text/accent) override theme_id''s own colors, keeping theme_id''s fonts/decor/layout. Null = use theme_id''s own colors.';
