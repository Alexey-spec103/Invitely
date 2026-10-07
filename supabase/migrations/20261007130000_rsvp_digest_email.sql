-- Adds an opt-in daily RSVP digest alongside the existing instant
-- "you got a new RSVP" email (20260930130000_rsvp_email_notifications_
-- toggle.sql). `rsvp_digest_email` defaults to false -- unlike the instant
-- toggle, this is a new email a host never asked for, so it starts off
-- until a host turns it on in RsvpNotificationToggle.tsx. `last_digest_sent_at`
-- lets app/api/cron/rsvp-digest/route.ts find only the responses that
-- arrived since the last digest, rather than re-sending the whole history
-- every day; null means "never sent one yet" (the cron route treats that as
-- "since the event was created").

alter table public.events
  add column if not exists rsvp_digest_email boolean not null default false;

alter table public.events
  add column if not exists last_digest_sent_at timestamptz;
