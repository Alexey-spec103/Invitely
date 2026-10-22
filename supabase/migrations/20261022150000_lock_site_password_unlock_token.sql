-- security-baseline audit (2026-10-22), discovered during a follow-up
-- investigation into Finding C (events over-exposing columns via its
-- public SELECT grant): site_password_unlock_token was NEVER excluded
-- from that grant, unlike its sibling site_password_hash. app/e/[slug]/
-- page.tsx read this column directly and compared it against the
-- `site_unlock_<eventId>` cookie to decide whether a guest had already
-- entered the correct password -- its own comment called this "safe to
-- compare," which was only true if the token itself stayed secret. It
-- didn't: anyone with the anon key could read any event's unlock token
-- directly over the REST API (`select id, site_password_unlock_token
-- from events where slug = eq.<slug>`), set the matching
-- `site_unlock_<id>` cookie themselves, and bypass the password gate
-- entirely -- without ever knowing the real password. This defeated the
-- one feature this column exists for, on every password-protected event.
--
-- Fixed the same way site_password_hash itself has always been handled:
-- the token now stays server-side only. check_site_unlock_token is a new
-- SECURITY DEFINER RPC that does the comparison internally and returns a
-- bare boolean, never the token's value -- app/e/[slug]/page.tsx calls
-- this instead of reading the column directly (see that file's own
-- updated comment).
create or replace function public.check_site_unlock_token(p_event_id uuid, p_token text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stored_token text;
begin
  select site_password_unlock_token into v_stored_token
  from public.events
  where id = p_event_id;

  return v_stored_token is not null and v_stored_token = p_token;
end;
$$;

grant execute on function public.check_site_unlock_token(uuid, text) to anon, authenticated;

-- Same dynamic-column-list rebuild as every other grant migration in this
-- project (20261015120000, 20261017120000, 20261022120000) -- reads the
-- live column list at apply time so this can't go stale, and excludes
-- site_password_unlock_token alongside the two columns already excluded
-- (last_digest_sent_at, site_password_hash). UPDATE is left untouched --
-- this column's only legitimate write path is already set_site_password
-- (SECURITY DEFINER), the direct column grant was never the write
-- concern here, only SELECT.
do $$
declare
  select_columns text;
begin
  select string_agg(quote_ident(column_name), ', ' order by column_name)
  into select_columns
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'events'
    and column_name not in ('last_digest_sent_at', 'site_password_hash', 'site_password_unlock_token');

  execute 'revoke select on public.events from anon, authenticated';
  execute format('grant select (%s) on public.events to anon, authenticated', select_columns);
end $$;

notify pgrst, 'reload schema';
