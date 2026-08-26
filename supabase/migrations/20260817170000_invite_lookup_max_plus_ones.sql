-- `guests.max_plus_ones` is a fully-built dashboard field (a host caps how
-- many extra people a given guest may bring) but was never surfaced on the
-- public RSVP path -- lookup_guest_by_invite_code only returned (id,
-- full_name), so a guest with a cap of 1 could still submit a party size of
-- 8 with nothing stopping them, breaking the exact headcount accuracy the
-- RSVP module exists for. Widening the existing security-definer function's
-- return columns (rather than adding a second RPC) keeps the single
-- exact-code-match lookup guarantee from the original comment intact.

drop function if exists public.lookup_guest_by_invite_code(uuid, text);

create or replace function public.lookup_guest_by_invite_code(
  p_event_id uuid,
  p_invite_code text
)
returns table (id uuid, full_name text, max_plus_ones int)
language sql
security definer
set search_path = public
as $$
  select g.id, g.full_name, g.max_plus_ones
  from public.guests g
  join public.events e on e.id = g.event_id
  where g.event_id = p_event_id
    and g.invite_code = p_invite_code
    and e.status = 'published'
  limit 1;
$$;

grant execute on function public.lookup_guest_by_invite_code(uuid, text) to anon, authenticated;
