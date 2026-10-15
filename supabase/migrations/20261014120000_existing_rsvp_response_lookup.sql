-- A guest revisiting their own invite link after already RSVP'ing saw a
-- blank form every time, with no memory of what they'd already said -- no
-- way to glance at or correct their answer without retyping the whole thing.
-- rsvp_responses has no public SELECT policy by design (same reasoning as
-- guests -- see 20260814130000_guests_update_and_invite_lookup.sql), so this
-- follows the exact same pattern already used for
-- get_guest_email_for_rsvp_confirmation: a security-definer function scoped
-- to an exact (event_id, guest_id) match on a published event, returning
-- only what the guest-facing RSVP form needs to recall and pre-fill its own
-- prior submission -- nothing that identifies or exposes any other guest.
--
-- Only usable by a guest already resolved to a real guest_id (via their
-- personal invite link, or the self-service find-or-create path after
-- they've typed a name once) -- there's no guest_id to look up before that,
-- which the guest-facing RSVP form handles client-side via a localStorage
-- recall instead (see components/sections/RsvpSection/variants/SimpleForm.tsx).

create or replace function public.get_existing_rsvp_response(
  p_event_id uuid,
  p_guest_id uuid
)
returns table (
  attending boolean,
  party_size int,
  allergies text,
  comment text,
  meal_preferences jsonb
)
language sql
security definer
set search_path = public
as $$
  select r.attending, r.party_size, r.allergies, r.comment, r.meal_preferences
  from public.rsvp_responses r
  join public.events e on e.id = r.event_id
  where r.event_id = p_event_id
    and r.guest_id = p_guest_id
    and e.status = 'published'
  limit 1;
$$;

grant execute on function public.get_existing_rsvp_response(uuid, uuid) to anon, authenticated;
