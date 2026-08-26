-- Multi-event accounts (Phase 8) let a host accumulate junk/duplicate/
-- mis-typed events in the EventSwitcher with no way to remove one --
-- `events` never got a delete policy in any prior migration (checked: only
-- select/insert/update exist). site_config and rsvp_responses are also
-- missing delete policies, needed so the app-level deleteEvent() cleanup
-- (which explicitly removes dependent rows before the event itself, rather
-- than relying on unknown FK cascade behavior on these pre-migration
-- tables) can actually take effect instead of silently no-op'ing under RLS.

drop policy if exists "Owners can delete their own events" on public.events;
create policy "Owners can delete their own events"
on public.events
for delete
to authenticated
using (owner_id = auth.uid());

drop policy if exists "Owners can delete their own site_config" on public.site_config;
create policy "Owners can delete their own site_config"
on public.site_config
for delete
to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = site_config.event_id
      and events.owner_id = auth.uid()
  )
);

drop policy if exists "Owners can delete their own rsvp responses" on public.rsvp_responses;
create policy "Owners can delete their own rsvp responses"
on public.rsvp_responses
for delete
to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = rsvp_responses.event_id
      and events.owner_id = auth.uid()
  )
);
