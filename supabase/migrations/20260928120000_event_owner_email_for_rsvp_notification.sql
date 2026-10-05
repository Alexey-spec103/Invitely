-- Host RSVP notification emails need to look up the event owner's email
-- from the public RSVP flow (anon key, no session, no auth.uid()). Same
-- shape as get_guest_email_for_rsvp_confirmation (20260910170000): a
-- security-definer function scoped to an exact, already-published event,
-- returning only the one column the notification email needs -- never a
-- broad auth.users read a caller could use to enumerate other accounts.
-- auth.users is directly readable from a security-definer function in this
-- project already (see delete_own_account, 20260910160000).

create or replace function public.get_event_owner_email_for_rsvp_notification(
  p_event_id uuid
)
returns text
language sql
security definer
set search_path = public
as $$
  select u.email
  from public.events e
  join auth.users u on u.id = e.owner_id
  where e.id = p_event_id
    and e.status = 'published'
  limit 1;
$$;

grant execute on function public.get_event_owner_email_for_rsvp_notification(uuid) to anon, authenticated;
