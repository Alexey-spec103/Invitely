-- banquet_tables had select/insert/delete for the owner since Phase 6b, but
-- no UPDATE policy -- needed to let a host rename a table without deleting
-- and recreating it (which would orphan every guest already assigned via
-- guests.table_id, since the old id would be gone).

alter table public.banquet_tables enable row level security;

drop policy if exists "Owners can update their own banquet tables" on public.banquet_tables;
create policy "Owners can update their own banquet tables"
on public.banquet_tables
for update
to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = banquet_tables.event_id
      and events.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.events
    where events.id = banquet_tables.event_id
      and events.owner_id = auth.uid()
  )
);
