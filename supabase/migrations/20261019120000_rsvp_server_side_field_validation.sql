-- Form-strategy audit (2026-10-19): submit_rsvp_response is SECURITY
-- DEFINER, granted to anon -- any client can call it directly over
-- Supabase's PostgREST RPC endpoint with arbitrary arguments, entirely
-- bypassing SimpleForm.tsx's own client-side checks
-- (`!guestName.trim() || attending === null`, and the `Math.min(Math.max(1,
-- ...), maxPartySize)` party-size clamp -- both pure client JS, enforced
-- nowhere server-side until now). Not a theoretical gap: a blank
-- p_guest_name or a p_party_size of -500 or 999999 would insert cleanly
-- today, silently corrupting the one number a host actually relies on this
-- feature for (their real headcount, shown in the dashboard and the daily
-- digest email). Matches this codebase's own standing rule -- re-validate
-- at the data layer, the same reasoning already applied to planId in the
-- Stripe checkout flow and to every guest-submitted RSVP field's HTML-
-- escaping before it reaches a host's inbox.
--
-- party_size is clamped to [1, 50], not re-derived from each event's own
-- configurable `maxPartySize` (that's UX guidance set per-event in the
-- section's own content, not a column on `events` this function can look
-- up without a second query) -- 50 is a generous absolute sanity ceiling,
-- not a replacement for the real per-event limit the client already
-- enforces for well-behaved callers.
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
