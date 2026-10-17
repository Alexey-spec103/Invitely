import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail, escapeHtml } from "@/lib/email";
import { getDictionary } from "@/lib/i18n/dictionary";
import { resolveEmailLocale } from "@/lib/i18n/locales";

// Same hardcoded-production-origin convention as app/robots.ts/app/sitemap.ts
// -- this route is server-to-server (Vercel Cron), there's no request origin
// to read the way a real browser-originated action would have one.
const SITE_URL = "https://www.invimbo.com";

/** Constant-time string comparison -- a plain `!==` leaks the secret's
 * content (not just its length) through how many characters matched before
 * the first mismatch, via response-time variance. `timingSafeEqual` throws
 * on a length mismatch rather than returning false, so the length check
 * must happen first -- that's safe to do in variable time, since the
 * secret's length isn't the sensitive part, its content is. */
function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Vercel Cron (see vercel.json) hits this once a day with no session at
 * all -- same "server-to-server, no auth.uid()" situation as the Stripe
 * webhook, so this is the one other place in the app allowed to use the
 * service-role client (see lib/supabase/service.ts's own comment on why
 * that's normally never done). Vercel signs every cron request with
 * `Authorization: Bearer ${CRON_SECRET}` when that env var is set -- set
 * CRON_SECRET in the Vercel project's env vars (any random string) for this
 * to actually run; until then every request 401s, so there's no window
 * where the route is live but unprotected. */
export async function GET(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const providedAuth = request.headers.get("authorization") ?? "";
  if (!timingSafeStringEqual(providedAuth, `Bearer ${expectedSecret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: events, error } = await supabase
    .from("events")
    .select("id, title, owner_id, last_digest_sent_at, default_locale")
    .eq("rsvp_digest_email", true)
    .eq("status", "published");

  if (error) {
    console.error("rsvp-digest: failed to list digest-enabled events", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let eventsEmailed = 0;

  for (const event of events ?? []) {
    // Null means "never sent one" -- the epoch floor picks up the event's
    // entire RSVP history on its very first digest, rather than silently
    // skipping responses that arrived before the host turned this on.
    const since = event.last_digest_sent_at ?? "1970-01-01T00:00:00Z";

    const { data: newResponses, error: newResponsesError } = await supabase
      .from("rsvp_responses")
      .select("guest_name, attending, submitted_at")
      .eq("event_id", event.id)
      .gt("submitted_at", since)
      .order("submitted_at", { ascending: true });

    if (newResponsesError) {
      console.error(`rsvp-digest: failed to load new responses for event ${event.id}`, newResponsesError);
      continue;
    }
    if (!newResponses || newResponses.length === 0) {
      continue;
    }

    const { data: allResponses } = await supabase
      .from("rsvp_responses")
      .select("attending")
      .eq("event_id", event.id);
    const totalResponded = allResponses?.length ?? 0;
    const totalYes = allResponses?.filter((response) => response.attending).length ?? 0;
    const totalNo = totalResponded - totalYes;

    // Direct feedback (2026-10-13): the digest only ever listed what's new
    // *this* round -- a host opening day 3's email had no way to see who'd
    // already said yes on days 1-2 without leaving the email. `since` is
    // the epoch floor on an event's very first digest, so there's nothing
    // "earlier" to show yet; on every later digest it's the real previous
    // send, and anyone who answered at or before it goes in this second,
    // visually-separated list -- shown underneath the new names, never
    // dropped, exactly mirroring what "Running total" already counts.
    const { data: previousResponses } = since === "1970-01-01T00:00:00Z"
      ? { data: [] as { guest_name: string | null; attending: boolean }[] }
      : await supabase
          .from("rsvp_responses")
          .select("guest_name, attending")
          .eq("event_id", event.id)
          .lte("submitted_at", since)
          .order("submitted_at", { ascending: true });

    const { data: userResult, error: userError } = await supabase.auth.admin.getUserById(event.owner_id);
    const ownerEmail = userResult?.user?.email;
    if (userError || !ownerEmail) {
      console.error(`rsvp-digest: no owner email for event ${event.id}`, userError);
      continue;
    }

    // Host's own event-setup language -- same reasoning as the other host-
    // facing emails (guests/actions.ts, e/[slug]/actions.ts).
    const t = getDictionary(resolveEmailLocale(event.default_locale)).email;

    // response.guest_name is guest-submitted, free-text, from the same
    // public RSVP form as VULN-001 (security-review, 2026-10-12) -- escape
    // before it lands in the host's inbox. event.title is host-controlled
    // but escaped too for consistency.
    const safeEventTitle = escapeHtml(event.title);
    const guestRow = (response: { guest_name: string | null; attending: boolean }) => {
      const safeGuestName = escapeHtml(response.guest_name || "-");
      return response.attending ? t.hostDigest.guestYes(safeGuestName) : t.hostDigest.guestNo(safeGuestName);
    };
    const newRows = newResponses.map(guestRow).join("");
    const previousRows = (previousResponses ?? []).map(guestRow).join("");

    const html = [
      t.hostDigest.intro(newResponses.length, safeEventTitle),
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${newRows}</table>`,
      previousRows
        ? t.hostDigest.previousHeading(previousResponses?.length ?? 0) +
          `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${previousRows}</table>`
        : "",
      t.hostDigest.runningTotal(totalResponded, totalYes, totalNo),
      t.hostDigest.manageNote(`${SITE_URL}/dashboard/${event.id}/guests`),
    ].join("");

    try {
      await sendEmail({
        to: ownerEmail,
        // Plain text, not HTML -- the raw title, not the HTML-escaped one.
        subject: t.hostDigest.subject(newResponses.length, event.title),
        html,
      });
      // Only advanced on a successful send -- a failed email leaves
      // last_digest_sent_at where it was, so tomorrow's digest re-includes
      // today's responses instead of silently dropping them.
      await supabase
        .from("events")
        .update({ last_digest_sent_at: new Date().toISOString() })
        .eq("id", event.id);
      eventsEmailed += 1;
    } catch (emailError) {
      // console.error alone never reaches Sentry here -- same gap as the
      // instant RSVP-notification catch blocks in app/e/[slug]/actions.ts.
      // Left silent, last_digest_sent_at correctly stays unmoved (so
      // tomorrow's run retries these responses), but nobody would ever
      // know this event's digest has been silently failing in the
      // meantime without this.
      console.error(`rsvp-digest: send failed for event ${event.id}`, emailError);
      Sentry.captureException(emailError, { extra: { eventId: event.id } });
    }
  }

  return NextResponse.json({ ok: true, eventsConsidered: events?.length ?? 0, eventsEmailed });
}
