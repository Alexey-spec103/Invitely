-- The RSVP module (Site tab toggle + public form on /e/[slug]) needs owners
-- to read their own responses and anonymous guests to submit new ones.
-- rsvp_responses has RLS enabled with no policies yet, so every access is
-- currently denied.

alter table public.rsvp_responses enable row level security;

drop policy if exists "Owners can read their own rsvp responses" on public.rsvp_responses;
create policy "Owners can read their own rsvp responses"
on public.rsvp_responses
for select
to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = rsvp_responses.event_id
      and events.owner_id = auth.uid()
  )
);

drop policy if exists "Public can submit rsvp responses for published events" on public.rsvp_responses;
create policy "Public can submit rsvp responses for published events"
on public.rsvp_responses
for insert
to anon, authenticated
with check (
  exists (
    select 1 from public.events
    where events.id = rsvp_responses.event_id
      and events.status = 'published'
  )
);
