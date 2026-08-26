-- guests has had select/insert/delete for the owner since Phase 1, but no
-- UPDATE policy — needed now for banquet table_id assignment.

alter table public.guests enable row level security;

drop policy if exists "Owners can update their own guests" on public.guests;
create policy "Owners can update their own guests"
on public.guests
for update
to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = guests.event_id
      and events.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.events
    where events.id = guests.event_id
      and events.owner_id = auth.uid()
  )
);

-- Personalized invite QR codes need the public site to resolve an
-- invite_code back to a guest's name (for RSVP prefill + auto-linking).
-- Deliberately NOT a public RLS policy on guests: row-level security can't
-- restrict access to "only if you already know this row's invite_code" —
-- a blanket "published events" policy would let anyone with the anon key
-- list every guest (name, email, phone) of any published event via a plain
-- REST query, not just look up one they already hold the code for.
-- Instead: a security-definer function that only ever returns a row on an
-- exact (event_id, invite_code) match — no listing/scanning capability
-- exists, and invite_code is a random uuid, so guessing one is infeasible.
create or replace function public.lookup_guest_by_invite_code(
  p_event_id uuid,
  p_invite_code text
)
returns table (id uuid, full_name text)
language sql
security definer
set search_path = public
as $$
  select g.id, g.full_name
  from public.guests g
  join public.events e on e.id = g.event_id
  where g.event_id = p_event_id
    and g.invite_code = p_invite_code
    and e.status = 'published'
  limit 1;
$$;

grant execute on function public.lookup_guest_by_invite_code(uuid, text) to anon, authenticated;
