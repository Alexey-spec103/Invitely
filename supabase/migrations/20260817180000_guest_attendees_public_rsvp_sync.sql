-- The public RSVP form only ever collected a party-size headcount, never
-- the actual names of the extra people a guest is bringing -- even though
-- guest_attendees exists specifically so banquet table/place cards can show
-- real individuals instead of "Maria Test + 2". A guest identified via
-- their personalized invite link (guestId resolved server-side through the
-- existing lookup_guest_by_invite_code RPC, never client-supplied directly)
-- can now optionally name their plus-ones on submission -- submitRsvp syncs
-- guest_attendees for that guest_id on every (re)submission. guest_attendees
-- only had an owner-scoped insert/select/delete policy before this; add the
-- same public-insert/public-delete pattern already used for rsvp_responses
-- (scoped to the event being published, not to proving invite-code
-- possession -- consistent with the existing trust model, since a real
-- guest_id is only ever obtainable client-side after the security-definer
-- RPC already validated the invite code).

drop policy if exists "Public can sync attendees for their own rsvp" on public.guest_attendees;
create policy "Public can sync attendees for their own rsvp"
on public.guest_attendees
for insert
to anon, authenticated
with check (
  exists (
    select 1 from public.guests g
    join public.events e on e.id = g.event_id
    where g.id = guest_attendees.guest_id
      and e.status = 'published'
  )
);

drop policy if exists "Public can clear attendees for their own rsvp" on public.guest_attendees;
create policy "Public can clear attendees for their own rsvp"
on public.guest_attendees
for delete
to anon, authenticated
using (
  exists (
    select 1 from public.guests g
    join public.events e on e.id = g.event_id
    where g.id = guest_attendees.guest_id
      and e.status = 'published'
  )
);
