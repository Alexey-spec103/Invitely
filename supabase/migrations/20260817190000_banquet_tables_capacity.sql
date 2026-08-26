-- Banquet tables had no capacity field, so a host bulk-assigning guests (a
-- feature built for 100+-guest weddings) had no way to know -- or be warned
-- -- that a table meant for 8 just got 20 people dumped on it. Nullable so
-- existing tables (and hosts who don't care to track capacity) are
-- unaffected; capacity is purely advisory, never enforced at the DB level.

alter table public.banquet_tables
  add column if not exists capacity int;
