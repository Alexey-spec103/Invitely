-- P0 fix (2026-10-27, guest-site critique): submit_rsvp_response's own
-- party-size check (`p_party_size < 1 or p_party_size > 50`, introduced
-- 20261019120000) rejects EVERY decline, not just an accept->decline edit.
-- The client (app/e/[slug]/actions.ts) always sends `p_party_size: 0` when
-- `input.attending` is false -- by design, a declining guest has no party
-- size -- but this function has never accepted 0 as valid. Confirmed live
-- via a direct RPC call against the production database (bypassing the
-- Next.js server action's own generic "couldn't submit" error message,
-- which was masking the real `INVALID_PARTY_SIZE` cause): any guest who
-- clicks "Regretfully declines" and submits gets a hard failure, 100% of
-- the time, regardless of whether they've RSVP'd before. The fix: only
-- enforce the [1, 50] attending-headcount range when the guest is actually
-- attending; a decline must send exactly 0 (matching the client's own
-- contract) and nothing else.
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

  if p_party_size is null
     or (p_attending and (p_party_size < 1 or p_party_size > 50))
     or (not p_attending and p_party_size <> 0) then
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
