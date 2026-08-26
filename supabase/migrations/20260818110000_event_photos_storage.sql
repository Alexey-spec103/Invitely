-- Storage bucket for Hero photo uploads (drag-and-drop, replacing the old
-- "paste a Photo URL" field). Public-read since invitation sites are public;
-- write access scoped to authenticated owners via a "{user_id}/{filename}"
-- path convention, same owner-scoping idea as every table RLS policy in
-- this project, just expressed through storage.foldername() instead of a
-- owner_id column.
insert into storage.buckets (id, name, public)
values ('event-photos', 'event-photos', true)
on conflict (id) do nothing;

create policy "Public read access to event photos"
on storage.objects for select
using (bucket_id = 'event-photos');

create policy "Authenticated users can upload their own event photos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'event-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Authenticated users can update their own event photos"
on storage.objects for update
to authenticated
using (bucket_id = 'event-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Authenticated users can delete their own event photos"
on storage.objects for delete
to authenticated
using (bucket_id = 'event-photos' and (storage.foldername(name))[1] = auth.uid()::text);
