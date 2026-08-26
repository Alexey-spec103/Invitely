-- Public (unauthenticated) visitors need to be able to open a published
-- wedding page at /e/[slug]. Both tables already have RLS enabled with no
-- SELECT policy for anon/authenticated, so every read was being denied.

alter table public.events enable row level security;
alter table public.site_config enable row level security;

drop policy if exists "Public can read published events" on public.events;
create policy "Public can read published events"
on public.events
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Public can read site_config of published events" on public.site_config;
create policy "Public can read site_config of published events"
on public.site_config
for select
to anon, authenticated
using (
  exists (
    select 1 from public.events
    where events.id = site_config.event_id
      and events.status = 'published'
  )
);

-- Publish the manually-seeded test event (slug = 'anna-igor') so it becomes
-- visible under the new policy above.
update public.events
set status = 'published'
where slug = 'anna-igor';
