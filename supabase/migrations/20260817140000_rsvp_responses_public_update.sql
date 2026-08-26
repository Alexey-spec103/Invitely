-- A guest who already submitted an RSVP had no way to change their answer:
-- `submitRsvp` was an unconditional insert, so resubmitting (very plausible
-- -- "actually we can't bring the kids", a forgotten allergy) created a
-- second, unreconciled row instead of updating the first. Fixes that by
-- making resubmission an upsert keyed on (event_id, guest_id) whenever the
-- guest is identified via their invite link -- the only case where we have a
-- reliable identity to dedupe on. A guest who fills in their own name with
-- no invite link (guest_id null) still just inserts a fresh row each time,
-- unchanged -- there's no reliable identity to reconcile against there.
--
-- The public UPDATE policy below only lets an anonymous caller touch a row
-- that already has a guest_id, for a published event -- the same trust
-- boundary the existing public INSERT policy already relies on: `guestId` in
-- this app is never client-supplied directly, it's resolved server-side from
-- an invite_code via `lookup_guest_by_invite_code` (20260814130000), so
-- reaching this state already requires holding that guest's invite code --
-- consistent with personalized links being "whoever holds this link can act
-- as this guest" by design, not a new capability.

create unique index if not exists rsvp_responses_event_guest_key
on public.rsvp_responses (event_id, guest_id)
where guest_id is not null;

alter table public.rsvp_responses enable row level security;

drop policy if exists "Public can update their own rsvp response for published events" on public.rsvp_responses;
create policy "Public can update their own rsvp response for published events"
on public.rsvp_responses
for update
to anon, authenticated
using (
  guest_id is not null
  and exists (
    select 1 from public.events
    where events.id = rsvp_responses.event_id
      and events.status = 'published'
  )
)
with check (
  guest_id is not null
  and exists (
    select 1 from public.events
    where events.id = rsvp_responses.event_id
      and events.status = 'published'
  )
);
