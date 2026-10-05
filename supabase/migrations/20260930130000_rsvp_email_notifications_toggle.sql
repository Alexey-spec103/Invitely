-- Lets a host turn off the "you got a new RSVP" email (submitRsvp in
-- app/e/[slug]/actions.ts sends one on every response today, unconditionally
-- once 20260928120000_event_owner_email_for_rsvp_notification.sql's RPC is
-- in place). Defaults to true so existing behavior doesn't silently change
-- for hosts who never touch the new setting.

alter table public.events
  add column if not exists rsvp_email_notifications boolean not null default true;
