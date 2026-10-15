-- Schema-drift sweep (2026-10-15), last item: rsvp_responses had a second,
-- undocumented unique constraint on (event_id, guest_id) --
-- rsvp_responses_event_id_guest_id_key, Postgres's own default
-- auto-generated name for a constraint on those two columns -- that no
-- migration in this repo ever created. Almost certainly added by hand at
-- some point via Supabase's own Table Editor UI rather than through the
-- migration system.
--
-- Confirmed via pg_constraint it's a real UNIQUE constraint, not just an
-- index: `contype = 'u'`. Functionally redundant with
-- rsvp_responses_event_guest_key (the migration-tracked partial unique
-- index from 20260817140000, `where guest_id is not null`) for this app's
-- actual data: Postgres treats NULL as distinct from NULL for uniqueness
-- purposes by default, so a full (non-partial) constraint on these columns
-- doesn't additionally block multiple null-guest_id rows either -- the two
-- behave the same for every row this app ever writes. Not required by
-- submit_rsvp_response's `on conflict (event_id, guest_id)` either --
-- that already resolves against the migration-tracked partial index alone.
--
-- Dropped rather than kept/formalized: it adds index-maintenance overhead
-- on every write with no behavioral difference, and more importantly isn't
-- reproducible from migrations alone -- a fresh environment built from this
-- repo's migration history would never have it, so the live DB and the
-- migration history agreeing is worth more here than keeping an
-- undocumented duplicate.

alter table public.rsvp_responses
  drop constraint if exists rsvp_responses_event_id_guest_id_key;
