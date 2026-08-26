-- gift_preferences had select/insert/delete for the owner since Phase 4c,
-- but no UPDATE policy -- the last remaining instance of the add/delete-only
-- pattern already fixed for guests and banquet_tables this session. Editing
-- a gift-wish item currently means delete+recreate; low data-integrity cost
-- here (no FK dependents), but still real re-typing friction.

alter table public.gift_preferences enable row level security;

drop policy if exists "Owners can update their own gift preferences" on public.gift_preferences;
create policy "Owners can update their own gift preferences"
on public.gift_preferences
for update
to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = gift_preferences.event_id
      and events.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.events
    where events.id = gift_preferences.event_id
      and events.owner_id = auth.uid()
  )
);
