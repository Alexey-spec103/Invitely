-- security-baseline audit (2026-10-22), Finding C: events' public SELECT
-- grant used an exclude-list (last_digest_sent_at, site_password_hash,
-- site_password_unlock_token) applied identically to both anon and
-- authenticated -- so owner_id, plan_id, custom_domain,
-- custom_domain_verification_token, venue_*, created_at, updated_at were
-- all readable by anyone with the public anon key, for any published
-- event, over the raw REST API, regardless of what the app's own code
-- happened to query. None of these alone grants account/payment access
-- (unlike the two actual exploits closed earlier today), but it's
-- unnecessary exposure from an exclude-list design that silently exposes
-- any future sensitive column by default -- precisely how the
-- custom_domain_verified_at regression happened.
--
-- A straight exclude-list narrowing for BOTH roles isn't safe: the
-- dashboard (always `authenticated`, reading its own owner_id=auth.uid()
-- row via RLS) genuinely needs the wide set, and plain GRANT has no way to
-- distinguish "authenticated reading their own row" from "authenticated
-- reading someone else's published row" -- both go through the exact same
-- grant. `anon` has no such legitimate wide need: every anon-reachable
-- `events` query in the codebase was audited (app/e/[slug]/page.tsx,
-- app/e/[slug]/calendar.ics/route.ts, app/e/[slug]/actions.ts,
-- app/e/[slug]/photos/page.tsx, and the custom-domain routing middleware
-- in lib/supabase/proxy.ts -- the complete set, confirmed via
-- `grep -rn '.from("events")' app/e/`) and the union of columns any of
-- them actually touch is exactly PUBLIC_EVENT_COLUMNS (lib/events.ts) plus
-- rsvp_email_notifications and default_locale (read narrowly, inline, by
-- the RSVP host-notification lookup in app/e/[slug]/actions.ts -- already
-- following this file's own established "narrow, defensively-coded query"
-- convention, just never folded into the shared constant since it's a
-- one-off read).
--
-- `authenticated` is left untouched here (still governed by the exclude-
-- list grant from 20261022150000) -- this migration only narrows `anon`.
revoke select on public.events from anon;
grant select (
  id, slug, title, subtitle_names, event_type, event_date, event_time,
  status, plan_id, custom_domain, custom_domain_verified_at,
  site_password_enabled, rsvp_email_notifications, default_locale
) on public.events to anon;

notify pgrst, 'reload schema';
