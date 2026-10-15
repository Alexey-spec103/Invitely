-- Schema-drift sweep (2026-10-15): the user asked to cross-check every
-- migration against the live database (migrations drifting from the live
-- DB has already happened twice before in this project's history -- see
-- 20261009150000's own comment). Ran the full sweep via a read-only SQL
-- dump of information_schema/pg_catalog; this is the first of two fixes it
-- surfaced.
--
-- rsvp_email_notifications (20260930130000) was just applied as a bare
-- `alter table add column`, with no matching grant update -- so even now
-- that the column exists, the dashboard toggle still can't read or write
-- it (a different failure than before: "permission denied for column"
-- instead of "column not found in schema cache"). Same root issue as
-- rsvp_digest_email, which has an UPDATE grant (added by 20261009150000,
-- which ran after that column existed) but never got a matching SELECT
-- grant at all -- the SELECT grant (20260910150000) is a static column
-- list that's never been rebuilt since, unlike UPDATE's dynamic rebuild.
--
-- Fixes both: rebuilds SELECT the same dynamic way UPDATE already is,
-- and re-runs the UPDATE rebuild now that rsvp_email_notifications exists
-- so it picks it up this time. Same exclusion list both grants have always
-- used: last_digest_sent_at (service-role/cron only) and
-- site_password_hash (public-readable-by-design exploit otherwise -- see
-- 20260910120000). custom_domain_verified_at is only excluded from UPDATE
-- (its own dedicated lockdown, 20261012120000) -- it was never excluded
-- from SELECT in the first place, so it's left out of this SELECT rebuild's
-- exclusion list to match.

do $$
declare
  select_columns text;
  update_columns text;
begin
  select string_agg(quote_ident(column_name), ', ' order by column_name)
  into select_columns
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'events'
    and column_name not in ('last_digest_sent_at', 'site_password_hash');

  select string_agg(quote_ident(column_name), ', ' order by column_name)
  into update_columns
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'events'
    and column_name not in ('last_digest_sent_at', 'site_password_hash', 'custom_domain_verified_at');

  execute 'revoke select on public.events from anon, authenticated';
  execute format('grant select (%s) on public.events to anon, authenticated', select_columns);

  execute 'revoke update on public.events from anon, authenticated';
  execute format('grant update (%s) on public.events to anon, authenticated', update_columns);
end $$;

notify pgrst, 'reload schema';
