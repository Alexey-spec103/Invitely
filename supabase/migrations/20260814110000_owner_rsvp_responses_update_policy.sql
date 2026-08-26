-- The dashboard needs to let an owner link an rsvp_responses row to a
-- guests row (guest_id), but rsvp_responses has no update policy yet —
-- every UPDATE is currently denied by RLS with zero matching policies.

alter table public.rsvp_responses enable row level security;

drop policy if exists "Owners can update their own rsvp responses" on public.rsvp_responses;
create policy "Owners can update their own rsvp responses"
on public.rsvp_responses
for update
to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = rsvp_responses.event_id
      and events.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.events
    where events.id = rsvp_responses.event_id
      and events.owner_id = auth.uid()
  )
);
