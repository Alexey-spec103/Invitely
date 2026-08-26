-- The dashboard hero form updates events.couple_name_1/2/event_date and
-- creates/updates site_config for the owner's event. events only has
-- owner insert/select policies so far (no update), and site_config has no
-- owner policies at all yet — both are needed for the form to work while
-- the event is still a draft.

drop policy if exists "Owners can update their own events" on public.events;
create policy "Owners can update their own events"
on public.events
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Owners can read their own site_config" on public.site_config;
create policy "Owners can read their own site_config"
on public.site_config
for select
to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = site_config.event_id
      and events.owner_id = auth.uid()
  )
);

drop policy if exists "Owners can insert their own site_config" on public.site_config;
create policy "Owners can insert their own site_config"
on public.site_config
for insert
to authenticated
with check (
  exists (
    select 1 from public.events
    where events.id = site_config.event_id
      and events.owner_id = auth.uid()
  )
);

drop policy if exists "Owners can update their own site_config" on public.site_config;
create policy "Owners can update their own site_config"
on public.site_config
for update
to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = site_config.event_id
      and events.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.events
    where events.id = site_config.event_id
      and events.owner_id = auth.uid()
  )
);
