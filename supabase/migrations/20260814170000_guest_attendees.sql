-- A "guest" record represents one invited party (with a max_plus_ones cap),
-- but banquet table/place cards need real names for everyone attending, not
-- just the party's primary contact repeated once per seat. guest_attendees
-- lets an owner name each person within a party.

create table if not exists public.guest_attendees (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.guests(id) on delete cascade,
  full_name text not null,
  created_at timestamptz default now()
);

alter table public.guest_attendees enable row level security;

drop policy if exists "Owners can read their own guest attendees" on public.guest_attendees;
create policy "Owners can read their own guest attendees"
on public.guest_attendees
for select
to authenticated
using (
  exists (
    select 1 from public.guests
    join public.events on events.id = guests.event_id
    where guests.id = guest_attendees.guest_id
      and events.owner_id = auth.uid()
  )
);

drop policy if exists "Owners can insert their own guest attendees" on public.guest_attendees;
create policy "Owners can insert their own guest attendees"
on public.guest_attendees
for insert
to authenticated
with check (
  exists (
    select 1 from public.guests
    join public.events on events.id = guests.event_id
    where guests.id = guest_attendees.guest_id
      and events.owner_id = auth.uid()
  )
);

drop policy if exists "Owners can delete their own guest attendees" on public.guest_attendees;
create policy "Owners can delete their own guest attendees"
on public.guest_attendees
for delete
to authenticated
using (
  exists (
    select 1 from public.guests
    join public.events on events.id = guests.event_id
    where guests.id = guest_attendees.guest_id
      and events.owner_id = auth.uid()
  )
);
