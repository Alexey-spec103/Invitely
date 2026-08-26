-- Self-service guest add: a guest arriving via the site's general share
-- link (no personal invite code, guestId resolved to null) had no `guests`
-- row to attach their RSVP to -- the host had to separately add them to the
-- guest list and manually match the response afterward. This mirrors
-- weddingpost.ru's "share one link, we build your guest list" flow: find an
-- existing guest by name (case/whitespace-insensitive) for this event, or
-- create one, and return its id so submitRsvp can link the response and
-- sync guest_attendees exactly like the invite-link path already does.
--
-- A security-definer RPC (not a public insert/select policy on `guests`)
-- keeps the guest list itself private -- granting broad public select would
-- leak every guest's name/phone/email to anyone who visits the site, same
-- privacy reasoning already applied to lookup_guest_by_invite_code.
create or replace function public.find_or_create_self_service_guest(
  p_event_id uuid,
  p_full_name text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_guest_id uuid;
  v_normalized text := lower(trim(regexp_replace(p_full_name, '\s+', ' ', 'g')));
begin
  if trim(p_full_name) = '' then
    raise exception 'A name is required';
  end if;

  if not exists (
    select 1 from public.events
    where id = p_event_id and status = 'published'
  ) then
    raise exception 'Event not found';
  end if;

  select g.id into v_guest_id
  from public.guests g
  where g.event_id = p_event_id
    and lower(trim(regexp_replace(g.full_name, '\s+', ' ', 'g'))) = v_normalized
  limit 1;

  if v_guest_id is not null then
    return v_guest_id;
  end if;

  insert into public.guests (event_id, full_name)
  values (p_event_id, trim(p_full_name))
  returning id into v_guest_id;

  return v_guest_id;
end;
$$;

grant execute on function public.find_or_create_self_service_guest(uuid, text) to anon, authenticated;
