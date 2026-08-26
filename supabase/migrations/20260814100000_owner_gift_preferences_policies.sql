-- The gift-wishes module (Site tab toggle + list on /e/[slug]) needs owners
-- to manage their own gift preference items, and anonymous guests to read
-- them on a published site. gift_preferences has RLS enabled with no
-- policies yet, so every access is currently denied — same starting state
-- guests/rsvp_responses were in before their own policies.

alter table public.gift_preferences enable row level security;

drop policy if exists "Owners can read their own gift preferences" on public.gift_preferences;
create policy "Owners can read their own gift preferences"
on public.gift_preferences
for select
to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = gift_preferences.event_id
      and events.owner_id = auth.uid()
  )
);

drop policy if exists "Owners can insert their own gift preferences" on public.gift_preferences;
create policy "Owners can insert their own gift preferences"
on public.gift_preferences
for insert
to authenticated
with check (
  exists (
    select 1 from public.events
    where events.id = gift_preferences.event_id
      and events.owner_id = auth.uid()
  )
);

drop policy if exists "Owners can delete their own gift preferences" on public.gift_preferences;
create policy "Owners can delete their own gift preferences"
on public.gift_preferences
for delete
to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = gift_preferences.event_id
      and events.owner_id = auth.uid()
  )
);

drop policy if exists "Public can read gift preferences of published events" on public.gift_preferences;
create policy "Public can read gift preferences of published events"
on public.gift_preferences
for select
to anon, authenticated
using (
  exists (
    select 1 from public.events
    where events.id = gift_preferences.event_id
      and events.status = 'published'
  )
);
