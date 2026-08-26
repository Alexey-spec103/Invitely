-- The dashboard's find-or-create logic (select an event by owner_id,
-- insert one if missing) has nothing at the database level stopping a
-- second draft event from being created for the same owner if that select
-- ever misses the existing row (races, transient reads, etc). With no
-- ordering on the follow-up "limit(1)" select, having two rows for one
-- owner also makes which one shows up on any given page load arbitrary —
-- this is what caused the dashboard to appear to "forget" saved data and
-- generate a new slug.
--
-- NOTE: this will fail to apply if the events table currently has more
-- than one row for the same owner_id. Check first with:
--   select owner_id, count(*) from public.events group by owner_id having count(*) > 1;
-- and manually decide which row to keep before retrying.

alter table public.events
  add constraint events_owner_id_key unique (owner_id);
