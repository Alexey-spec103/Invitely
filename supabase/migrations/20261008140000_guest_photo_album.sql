-- Shared guest photo album: any guest can open a QR/link for their event and
-- upload photos with no login, the host sees them all in a gallery and can
-- delete any of them. Two layers, same shape as the existing self-service
-- RSVP precedent (20260818120000_self_service_guest_rsvp.sql):
--   1. Storage ("guest-photos" bucket, created below) holds the actual
--      image bytes, scoped per-event by a "{event_id}/..." path prefix.
--   2. This table holds the metadata (which event, which storage path, who
--      uploaded it) so the host dashboard can list/delete without needing
--      Storage "list" access, and so the record_guest_photo() RPC below has
--      somewhere to enforce a rate limit against abuse.
--
-- Unlike every other bucket in this project (event-photos, event-music --
-- both `public: true`, readable by anyone who knows or guesses a path),
-- this bucket is NOT public. A guest's own uploaded photos are a more
-- sensitive case than a host's own hero photo: there's no reason any guest
-- or stranger should be able to list or fetch another event's uploads, and
-- a guest never needs to re-read their own upload from Storage at all (the
-- upload page shows their own photo from the in-memory file they just
-- picked, not a re-fetch). Only the owning host can read or delete.
create table if not exists public.guest_photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  storage_path text not null unique,
  -- A random id the upload page generates once and keeps in localStorage --
  -- not a guest identity, just enough to rate-limit one device/browser
  -- without requiring a name or login. Never shown to the host.
  uploader_token text not null,
  created_at timestamptz not null default now()
);

create index if not exists guest_photos_event_id_idx on public.guest_photos(event_id);
create index if not exists guest_photos_rate_limit_idx on public.guest_photos(event_id, uploader_token, created_at);

alter table public.guest_photos enable row level security;

-- No insert policy here at all, by design -- inserts only happen through
-- record_guest_photo() below (security definer), same reasoning as
-- find_or_create_self_service_guest: a direct public insert policy would
-- need its own rate-limit logic duplicated in SQL anyway, and a RPC keeps
-- that logic in exactly one place.

drop policy if exists "Owners can read their own guest photos" on public.guest_photos;
create policy "Owners can read their own guest photos"
on public.guest_photos
for select
to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = guest_photos.event_id
      and events.owner_id = auth.uid()
  )
);

drop policy if exists "Owners can delete their own guest photos" on public.guest_photos;
create policy "Owners can delete their own guest photos"
on public.guest_photos
for delete
to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = guest_photos.event_id
      and events.owner_id = auth.uid()
  )
);

-- Records one guest-uploaded photo after the file itself has already been
-- written to the "guest-photos" Storage bucket (the client/server action
-- uploads the bytes first, then calls this). security definer so an
-- anonymous guest can write a row despite no public insert policy existing
-- on the table -- same precedent as find_or_create_self_service_guest.
--
-- Rate limit: capped at 20 photos per (event, uploader_token) per rolling
-- 24h window -- generous for a real guest uploading reception photos on
-- their phone, low enough to make a scripted spam loop pointless. Enforced
-- here, not just client-side, since this RPC is directly callable.
create or replace function public.record_guest_photo(
  p_event_id uuid,
  p_storage_path text,
  p_uploader_token text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_photo_id uuid;
  v_recent_count int;
begin
  if trim(p_uploader_token) = '' then
    raise exception 'Missing uploader token';
  end if;

  -- Defense in depth: the storage insert policy below already restricts
  -- where an anonymous upload can land, but re-check here too so this RPC
  -- never trusts a path it didn't verify itself.
  if p_storage_path !~ ('^' || p_event_id::text || '/') then
    raise exception 'Storage path does not match event';
  end if;

  if not exists (
    select 1 from public.events
    where id = p_event_id and status = 'published'
  ) then
    raise exception 'Event not found';
  end if;

  select count(*) into v_recent_count
  from public.guest_photos
  where event_id = p_event_id
    and uploader_token = p_uploader_token
    and created_at > now() - interval '24 hours';

  if v_recent_count >= 20 then
    raise exception 'Too many photos uploaded recently -- please try again later';
  end if;

  insert into public.guest_photos (event_id, storage_path, uploader_token)
  values (p_event_id, p_storage_path, p_uploader_token)
  returning id into v_photo_id;

  return v_photo_id;
end;
$$;

grant execute on function public.record_guest_photo(uuid, text, text) to anon, authenticated;

-- Storage bucket, NOT public (see the table comment above for why this
-- diverges from event-photos/event-music's `public: true`). Objects are
-- stored at "{event_id}/{uploader_token}-{timestamp}.{ext}".
insert into storage.buckets (id, name, public)
values ('guest-photos', 'guest-photos', false)
on conflict (id) do nothing;

drop policy if exists "Anyone can upload to a published event's guest photos" on storage.objects;
create policy "Anyone can upload to a published event's guest photos"
on storage.objects for insert
to anon, authenticated
with check (
  bucket_id = 'guest-photos'
  and exists (
    select 1 from public.events e
    where e.id::text = (storage.foldername(name))[1]
      and e.status = 'published'
  )
);

drop policy if exists "Owners can read their own event's guest photos" on storage.objects;
create policy "Owners can read their own event's guest photos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'guest-photos'
  and exists (
    select 1 from public.events e
    where e.id::text = (storage.foldername(name))[1]
      and e.owner_id = auth.uid()
  )
);

drop policy if exists "Owners can delete their own event's guest photos" on storage.objects;
create policy "Owners can delete their own event's guest photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'guest-photos'
  and exists (
    select 1 from public.events e
    where e.id::text = (storage.foldername(name))[1]
      and e.owner_id = auth.uid()
  )
);
