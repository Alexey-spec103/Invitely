-- Storage bucket for background-music uploads, same shape as
-- 20260818110000_event_photos_storage.sql's event-photos bucket: public
-- read (invitation sites are public), write scoped to the owning
-- authenticated user via a "{user_id}/{filename}" path convention.
insert into storage.buckets (id, name, public)
values ('event-music', 'event-music', true)
on conflict (id) do nothing;

create policy "Public read access to event music"
on storage.objects for select
using (bucket_id = 'event-music');

create policy "Authenticated users can upload their own event music"
on storage.objects for insert
to authenticated
with check (bucket_id = 'event-music' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Authenticated users can update their own event music"
on storage.objects for update
to authenticated
using (bucket_id = 'event-music' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Authenticated users can delete their own event music"
on storage.objects for delete
to authenticated
using (bucket_id = 'event-music' and (storage.foldername(name))[1] = auth.uid()::text);
