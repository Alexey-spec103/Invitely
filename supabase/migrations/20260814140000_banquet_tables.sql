-- Banquet seating: named tables an owner can assign guests to, so table
-- cards (per table) and place cards (per guest) can be generated.

create table if not exists public.banquet_tables (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

alter table public.guests
  add column if not exists table_id uuid references public.banquet_tables(id) on delete set null;

alter table public.banquet_tables enable row level security;

drop policy if exists "Owners can read their own banquet tables" on public.banquet_tables;
create policy "Owners can read their own banquet tables"
on public.banquet_tables
for select
to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = banquet_tables.event_id
      and events.owner_id = auth.uid()
  )
);

drop policy if exists "Owners can insert their own banquet tables" on public.banquet_tables;
create policy "Owners can insert their own banquet tables"
on public.banquet_tables
for insert
to authenticated
with check (
  exists (
    select 1 from public.events
    where events.id = banquet_tables.event_id
      and events.owner_id = auth.uid()
  )
);

drop policy if exists "Owners can delete their own banquet tables" on public.banquet_tables;
create policy "Owners can delete their own banquet tables"
on public.banquet_tables
for delete
to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = banquet_tables.event_id
      and events.owner_id = auth.uid()
  )
);
