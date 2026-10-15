-- URGENT production fix: real guests cannot submit RSVPs right now. Direct
-- confirmed via Supabase's own API Gateway logs (0 requests reaching
-- PostgREST or Postgres at all -- rejected at the gateway layer itself,
-- before the database is ever involved) that POST/PATCH requests straight
-- to a table's REST endpoint (/rest/v1/rsvp_responses) are being blocked for
-- the anon role, regardless of which API key format is used (confirmed with
-- both the new sb_publishable_... key and the legacy JWT anon key -- same
-- 401, same gateway-only log entry, no DB-side error at all). A schema-cache
-- reload (`notify pgrst, 'reload schema'`) didn't change anything either,
-- ruling out the usual drift-between-migrations-and-live-DB culprit (see
-- 20261009150000's own comment on that). RLS itself is confirmed correct --
-- `set role anon; insert into rsvp_responses (...) ...` in the SQL editor
-- succeeds cleanly, proving the policies/grants are fine; it's specifically
-- POST-to-table-endpoint through the gateway that's broken, for a reason
-- outside this app's control (a Supabase-platform-side issue, not something
-- a migration here can fix directly).
--
-- But RPC calls (POST to /rest/v1/rpc/...) go through the SAME gateway and
-- keep working fine for the anon role (confirmed: find_or_create_self_
-- service_guest, lookup_guest_by_invite_code, check_and_log_rsvp_submission
-- all still succeed) -- so moving the actual write behind a security-
-- definer RPC, the same pattern already used for every other anon-callable
-- guarded write in this app, routes around the broken path entirely without
-- needing to wait on Supabase to fix their gateway. Combines the
-- rsvp_responses upsert/insert AND the guest_attendees sync (previously two
-- separate direct-table calls in submitRsvp, both equally broken) into one
-- call, one transaction.

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
    on conflict (event_id, guest_id) do update set
      guest_name = excluded.guest_name,
      attending = excluded.attending,
      party_size = excluded.party_size,
      allergies = excluded.allergies,
      comment = excluded.comment,
      meal_preferences = excluded.meal_preferences;

    -- Same delete-then-insert resync submitRsvp always did (see its own
    -- comment) -- small expected size, trivially idempotent, and a decline
    -- correctly clears the party to zero named attendees too.
    delete from public.guest_attendees where guest_id = p_guest_id;
    if p_attending and p_attendee_names is not null then
      insert into public.guest_attendees (guest_id, full_name)
      select p_guest_id, name
      from unnest(p_attendee_names) as name
      where length(trim(name)) > 0;
    end if;
  else
    -- No guest_id -- a guest whose name couldn't resolve to a `guests` row
    -- at all (same fallback path submitRsvp's own comment describes). No
    -- row to sync attendees onto either.
    insert into public.rsvp_responses
      (event_id, guest_id, guest_name, attending, party_size, allergies, comment, meal_preferences)
    values
      (p_event_id, null, p_guest_name, p_attending, p_party_size, p_allergies, p_comment, p_meal_preferences);
  end if;
end;
$$;

grant execute on function public.submit_rsvp_response(uuid, uuid, text, boolean, int, text, text, jsonb, text[]) to anon, authenticated;
