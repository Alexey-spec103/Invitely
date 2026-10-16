-- CRITICAL regression, self-inflicted earlier today: 20261015160000 dropped
-- rsvp_responses_event_id_guest_id_key (a full, non-partial unique
-- constraint on (event_id, guest_id)) as an "undocumented duplicate" of the
-- migration-tracked partial unique index rsvp_responses_event_guest_key
-- (20260817140000, `where guest_id is not null`) -- reasoned to be
-- functionally redundant for data-uniqueness purposes (true: NULL guest_id
-- is never considered a duplicate of another NULL either way), but that
-- analysis missed that submit_rsvp_response's own `on conflict (event_id,
-- guest_id) do update set ...` clause (20261014130000) has no WHERE
-- predicate -- Postgres can only infer a bare ON CONFLICT target against a
-- FULL unique constraint/index, never a partial one, unless the ON CONFLICT
-- clause repeats that exact predicate itself. The dropped constraint was
-- the ONLY thing making that inference succeed; the partial index alone
-- never could have. Confirmed live: every real RSVP submission through this
-- RPC has been failing with Postgres error 42P10 ("no unique or exclusion
-- constraint matching the ON CONFLICT specification") since that migration
-- was applied -- the exact same class of outage this RPC was built to fix
-- in the first place (20261014130000's own comment), reintroduced by the
-- "cleanup" migration that came after it.
--
-- Fix: add the matching `where guest_id is not null` predicate to the ON
-- CONFLICT clause instead of re-adding the redundant full constraint --
-- this branch only ever runs when `p_guest_id is not null` is already true
-- (see the surrounding `if` just above the insert), so the predicate is
-- always satisfied here and costs nothing. Keeps the schema exactly as
-- 20261015160000 intended (one real unique index, not two), fixes the
-- actual root cause instead of papering over it with a second redundant
-- constraint.

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
