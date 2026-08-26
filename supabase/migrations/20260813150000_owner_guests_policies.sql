-- The dashboard guest list (app-shell Phase 1) lets an owner add/view/
-- remove guests for their own event. guests has RLS enabled with no
-- policies yet, so every access is currently denied — add the same
-- owner-scoped exists() pattern used for site_config.

alter table public.guests enable row level security;

drop policy if exists "Owners can read their own guests" on public.guests;
create policy "Owners can read their own guests"
on public.guests
for select
to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = guests.event_id
      and events.owner_id = auth.uid()
  )
);

drop policy if exists "Owners can insert their own guests" on public.guests;
create policy "Owners can insert their own guests"
on public.guests
for insert
to authenticated
with check (
  exists (
    select 1 from public.events
    where events.id = guests.event_id
      and events.owner_id = auth.uid()
  )
);

drop policy if exists "Owners can delete their own guests" on public.guests;
create policy "Owners can delete their own guests"
on public.guests
for delete
to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = guests.event_id
      and events.owner_id = auth.uid()
  )
);
