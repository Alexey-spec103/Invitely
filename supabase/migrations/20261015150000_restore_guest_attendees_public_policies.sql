-- Schema-drift sweep (2026-10-15), third item: guest_attendees is missing
-- the two public RSVP-sync policies from 20260817180000_guest_attendees_
-- public_rsvp_sync.sql ("Public can sync attendees for their own rsvp"
-- INSERT, "Public can clear attendees for their own rsvp" DELETE) -- never
-- applied to the live DB, same drift pattern as everything else in this
-- sweep.
--
-- Not currently an active bug: today's submit_rsvp_response RPC (security
-- definer) already writes/clears guest_attendees directly, bypassing RLS
-- entirely regardless of whether these policies exist. Restored anyway for
-- consistency with the documented intent and as defense in depth -- so the
-- table's own policies match what every other anon-write path in this app
-- already has, in case anything ever needs a direct (non-RPC) path here
-- again.

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
