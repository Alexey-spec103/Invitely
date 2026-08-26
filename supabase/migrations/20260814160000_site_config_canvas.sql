-- Phase 7: a real drag-and-drop canvas constructor, coexisting with the
-- existing structured section system rather than replacing it. layout_mode
-- picks which renderer app/e/[slug]/page.tsx uses; existing events default
-- to 'structured' and are completely unaffected by this migration.

alter table public.site_config
  add column layout_mode text not null default 'structured',
  add column canvas jsonb;

alter table public.site_config
  add constraint site_config_layout_mode_check
  check (layout_mode in ('structured', 'canvas'));

-- No RLS changes needed: existing owner/public policies on site_config
-- already cover these columns row-wise.
