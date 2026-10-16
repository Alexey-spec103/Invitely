-- Real bug, found via live testing (not reported by a user yet, but
-- verified failing): lookup_guest_table_by_name's `if v_row is null then`
-- check (20260818130000) is a classic PL/pgSQL composite-NULL trap. `v_row`
-- only ever holds two columns, `table_name` and `attending`, both pulled
-- through LEFT JOINs -- so for a guest who genuinely exists on the list but
-- has no table assigned yet AND hasn't RSVP'd yet, both columns are NULL,
-- and Postgres's `ROW IS NULL` evaluates true whenever EVERY field of a
-- composite is null. That's indistinguishable here from "no guest matched
-- at all" -- confirmed live: a real guest typing their own name exactly
-- right got "not found" (found: false) purely because they had no table
-- and no RSVP yet, which is likely the MOST common case for an early
-- lookup (a guest checking in before responding or before the host has
-- finished seating). ASCII names hit this identically to accented ones --
-- not a locale/collation issue, confirmed by testing plain "jose".
--
-- Fix: use PL/pgSQL's own `FOUND` special variable, set automatically by
-- the preceding SELECT INTO to whether it actually matched a row -- the
-- correct, unambiguous way to test this, unlike inspecting the record's
-- own field values.

create or replace function public.lookup_guest_table_by_name(
  p_event_id uuid,
  p_full_name text
)
returns table (found boolean, table_name text, attending boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_normalized text := lower(trim(regexp_replace(p_full_name, '\s+', ' ', 'g')));
  v_row record;
begin
  if not exists (
    select 1 from public.events where id = p_event_id and status = 'published'
  ) then
    return query select false, null::text, null::boolean;
    return;
  end if;

  select t.name as table_name, r.attending
  into v_row
  from public.guests g
  left join public.banquet_tables t on t.id = g.table_id
  left join public.rsvp_responses r on r.guest_id = g.id
  where g.event_id = p_event_id
    and lower(trim(regexp_replace(g.full_name, '\s+', ' ', 'g'))) = v_normalized
  limit 1;

  if not found then
    return query select false, null::text, null::boolean;
  else
    return query select true, v_row.table_name, v_row.attending;
  end if;
end;
$$;

grant execute on function public.lookup_guest_table_by_name(uuid, text) to anon, authenticated;
