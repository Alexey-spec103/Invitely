-- The dashboard lets an authenticated user create and view their own event
-- before it is published. The existing policy only allows reading events
-- with status = 'published', so owners need their own insert/select
-- policies to manage a draft event.

drop policy if exists "Owners can insert their own events" on public.events;
create policy "Owners can insert their own events"
on public.events
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "Owners can read their own events" on public.events;
create policy "Owners can read their own events"
on public.events
for select
to authenticated
using (owner_id = auth.uid());
