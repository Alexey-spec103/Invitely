-- RSVP confirmation emails need to look up a guest's email from the public
-- RSVP flow (anon key, no session). guests has no public SELECT policy by
-- design (see 20260814130000_guests_update_and_invite_lookup.sql -- a
-- blanket "published events" policy would let anyone list every guest's
-- name/email/phone via a plain REST query). Same fix as that migration
-- used for invite-code lookup: a security-definer function scoped to an
-- exact (event_id, guest_id) match on a published event, returning only the
-- one column the confirmation email needs.

create or replace function public.get_guest_email_for_rsvp_confirmation(
  p_event_id uuid,
  p_guest_id uuid
)
returns text
language sql
security definer
set search_path = public
as $$
  select g.email
  from public.guests g
  join public.events e on e.id = g.event_id
  where g.event_id = p_event_id
    and g.id = p_guest_id
    and e.status = 'published'
  limit 1;
$$;

grant execute on function public.get_guest_email_for_rsvp_confirmation(uuid, uuid) to anon, authenticated;
