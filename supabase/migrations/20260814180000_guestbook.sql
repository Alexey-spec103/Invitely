-- weddingpost.ru's top tier sells a public "wall of wishes" from guests —
-- rsvp_responses.comment is already captured but never shown publicly.
-- Rather than a blanket public-read policy on rsvp_responses (which would
-- also expose meal_preferences/allergies/guest_id), a security-definer
-- function surfaces only the guestbook-safe columns for non-hidden,
-- non-empty comments on published events. guestbook_hidden defaults to
-- false so messages show immediately (matches real usage — only invited
-- guests with the link can submit), with an owner-side toggle to remove
-- one if needed. The existing "Owners can update their own rsvp responses"
-- policy already covers writing this new column, no RLS change needed.

alter table public.rsvp_responses
  add column if not exists guestbook_hidden boolean not null default false;

create or replace function public.get_guestbook_messages(p_event_id uuid)
returns table (guest_name text, comment text, submitted_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select r.guest_name, r.comment, r.submitted_at
  from public.rsvp_responses r
  join public.events e on e.id = r.event_id
  where r.event_id = p_event_id
    and e.status = 'published'
    and r.guestbook_hidden = false
    and r.comment is not null
    and length(trim(r.comment)) > 0
  order by r.submitted_at desc;
$$;

grant execute on function public.get_guestbook_messages(uuid) to anon, authenticated;
