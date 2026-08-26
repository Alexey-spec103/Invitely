-- "Find my table" banquet navigator section: a guest arriving via their
-- personal invite link should just be told their table outright; a guest
-- arriving via the site's general link (self-service, see
-- 20260818120000_self_service_guest_rsvp.sql) needs to search by name.
-- Both paths return only {found, table_name, attending} -- never the whole
-- guest row -- so this can't be used to enumerate the guest list or leak
-- anyone else's contact info, same privacy reasoning as every other public
-- RPC in this project.

-- Widen the existing invite-code lookup (same "widen, don't add a second
-- RPC for a small additional field" precedent as the earlier
-- max_plus_ones change) to also resolve the guest's assigned table name via
-- a join, computed inside the security-definer function so no public
-- select policy on `guests` or `banquet_tables` is needed.
drop function if exists public.lookup_guest_by_invite_code(uuid, text);

create or replace function public.lookup_guest_by_invite_code(
  p_event_id uuid,
  p_invite_code text
)
returns table (id uuid, full_name text, max_plus_ones int, table_name text)
language sql
security definer
set search_path = public
as $$
  select g.id, g.full_name, g.max_plus_ones, t.name as table_name
  from public.guests g
  join public.events e on e.id = g.event_id
  left join public.banquet_tables t on t.id = g.table_id
  where g.event_id = p_event_id
    and g.invite_code = p_invite_code
    and e.status = 'published'
  limit 1;
$$;

grant execute on function public.lookup_guest_by_invite_code(uuid, text) to anon, authenticated;

-- Self-service name search, for a visitor with no invite code.
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

  if v_row is null then
    return query select false, null::text, null::boolean;
  else
    return query select true, v_row.table_name, v_row.attending;
  end if;
end;
$$;

grant execute on function public.lookup_guest_table_by_name(uuid, text) to anon, authenticated;
