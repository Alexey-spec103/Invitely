-- security-baseline audit (2026-10-22): submit_rsvp_response (latest
-- version: 20261019120000) checks that p_event_id is published, but never
-- checks that the `guests` row named by p_guest_id actually belongs to
-- p_event_id. Anyone who legitimately holds an invite code for guest G in
-- event A (a capability this app already treats as "can act as this
-- guest," by design -- see lookup_guest_by_invite_code's own comment) could
-- call this RPC with an unrelated event B's id, inserting an
-- rsvp_responses row mislabeled under event B and overwriting G's
-- guest_attendees (keyed only by guest_id, with no event check) regardless
-- of which event was actually named. Bounded impact -- cross-tenant data
-- mislabeling, not data theft, since the caller already had legitimate
-- access to this guest's own data -- but it's a missing authorization
-- check on a SECURITY DEFINER function, the exact class of bug the other
-- RPCs in this file guard against for their own tables.
create or replace function public.submit_rsvp_response(
  p_event_id uuid,
  p_guest_id uuid,
  p_guest_name text,
  p_attending boolean,
  p_party_size int,
  p_allergies text,
  p_comment text,
  p_meal_preferences jsonb,
  p_attendee_names text[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.events where id = p_event_id and status = 'published') then
    raise exception 'EVENT_NOT_PUBLISHED';
  end if;

  if p_guest_name is null or length(trim(p_guest_name)) = 0 then
    raise exception 'GUEST_NAME_REQUIRED';
  end if;

  if p_party_size is null or p_party_size < 1 or p_party_size > 50 then
    raise exception 'INVALID_PARTY_SIZE';
  end if;

  if p_guest_id is not null then
    if not exists (select 1 from public.guests where id = p_guest_id and event_id = p_event_id) then
      raise exception 'GUEST_EVENT_MISMATCH';
    end if;

    insert into public.rsvp_responses
      (event_id, guest_id, guest_name, attending, party_size, allergies, comment, meal_preferences)
    values
      (p_event_id, p_guest_id, p_guest_name, p_attending, p_party_size, p_allergies, p_comment, p_meal_preferences)
    on conflict (event_id, guest_id) where guest_id is not null do update set
      guest_name = excluded.guest_name,
      attending = excluded.attending,
      party_size = excluded.party_size,
      allergies = excluded.allergies,
      comment = excluded.comment,
      meal_preferences = excluded.meal_preferences;

    delete from public.guest_attendees where guest_id = p_guest_id;
    if p_attending and p_attendee_names is not null then
      insert into public.guest_attendees (guest_id, full_name)
      select p_guest_id, name
      from unnest(p_attendee_names) as name
      where length(trim(name)) > 0;
    end if;
  else
    insert into public.rsvp_responses
      (event_id, guest_id, guest_name, attending, party_size, allergies, comment, meal_preferences)
    values
      (p_event_id, null, p_guest_name, p_attending, p_party_size, p_allergies, p_comment, p_meal_preferences);
  end if;
end;
$$;

grant execute on function public.submit_rsvp_response(uuid, uuid, text, boolean, int, text, text, jsonb, text[]) to anon, authenticated;

notify pgrst, 'reload schema';
