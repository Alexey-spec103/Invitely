"use server";

import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { RsvpFormInput } from "@/components/sections/RsvpSection";
import type { BanquetTableLookupResult } from "@/components/sections/BanquetNavigatorSection";
import type { Json } from "@/lib/supabase/database.types";
import { sendEmail, escapeHtml } from "@/lib/email";
import { getDictionary } from "@/lib/i18n/dictionary";
import { resolveEmailLocale, type Locale } from "@/lib/i18n/locales";

export async function submitRsvp(
  eventId: string,
  guestId: string | null,
  maxPlusOnes: number | null,
  locale: Locale,
  input: RsvpFormInput
): Promise<{ ok: true } | { ok: false; message: string }> {
  const t = getDictionary(locale).rsvp;
  // Anti-spam: a filled honeypot or a submission faster than any human could
  // plausibly manage is treated as spam and silently dropped -- returning
  // normally (not throwing) so a bot gets no signal it was rejected, rather
  // than an error it could use to refine its attempt. Both signals are only
  // ever meaningful when sent by the real public form (this server action
  // is directly callable, so client-side-only checks would be trivial to
  // bypass); undefined/missing values (e.g. a future non-SimpleForm variant
  // that doesn't send them) are treated as passing, not as spam.
  if (input.honeypot) {
    return { ok: true };
  }
  if (input.formRenderedAt != null && Date.now() - input.formRenderedAt < 1500) {
    return { ok: true };
  }

  const supabase = await createClient();

  // Rate limit: the honeypot + timing checks above stop an unsophisticated
  // bot, but a scripted one that waits a couple seconds between requests
  // sails through both uncontested -- this closes that gap (form-strategy
  // audit, 2026-10-12). x-forwarded-for's first entry is the original
  // client IP (Vercel appends proxy hops after it); falls back to
  // x-real-ip.
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() || headerList.get("x-real-ip");
  if (!ipAddress) {
    // code-review (2026-10-12): a shared "unknown" bucket would rate-limit
    // every visitor to this event together once any 5 of them (real or
    // not) had submitted within the window -- a real guest could get
    // silently dropped by other real guests' traffic, not just by a bot's.
    // Neither header is expected to be missing in production behind
    // Vercel; logging makes a misconfigured proxy visible instead of
    // silently degrading every event's RSVP form to "5 total submissions
    // per 10 minutes." Same fails-open philosophy as the RPC-error branch
    // below -- skipping the check here only means this one request went
    // unrated, not that real guests get blocked.
    console.warn("submitRsvp: no client IP header present, skipping rate limit for this request");
  } else {
    const { data: withinLimit, error: rateLimitError } = await supabase.rpc("check_and_log_rsvp_submission", {
      p_event_id: eventId,
      p_ip_address: ipAddress,
    });
    if (rateLimitError) {
      // Fails open, not closed -- a logging/RPC outage shouldn't block
      // every real guest's RSVP; it only means this one submission went
      // unlogged for rate-limiting purposes.
      console.error("submitRsvp rate-limit check failed", rateLimitError);
    } else if (withinLimit === false) {
      // Same silent-success pattern as the honeypot/timing checks above: a
      // bot gets no signal it was specifically rate-limited.
      return { ok: true };
    }
  }

  // A guest arriving via the site's general share link (no personal invite
  // code) has no existing `guests` row -- find-or-create one by name so
  // they still show up in the host's guest list and banquet tools, instead
  // of only ever existing as an unmatched RSVP response. Same "share one
  // link, we build the list" flow weddingpost.ru's self-service invites
  // use. Routed through a security-definer RPC rather than a direct insert
  // so anonymous visitors never get a broad policy on `guests` (see
  // 20260818120000_self_service_guest_rsvp.sql).
  let resolvedGuestId = guestId;
  if (!resolvedGuestId && input.guestName.trim()) {
    const { data: foundOrCreatedId, error: findError } = await supabase.rpc(
      "find_or_create_self_service_guest",
      { p_event_id: eventId, p_full_name: input.guestName.trim() }
    );
    if (findError) {
      console.error("submitRsvp self-service guest lookup failed", findError);
    } else {
      resolvedGuestId = foundOrCreatedId;
    }
  }

  // The client already clamps to this cap, but a guest could call the
  // server action directly with an arbitrary party size -- re-clamp here
  // using the cap resolved server-side from the guest's own invite link,
  // never trusting a max the client might send.
  const partySize =
    input.attending && maxPlusOnes != null
      ? Math.min(input.partySize, maxPlusOnes + 1)
      : input.partySize;

  // URGENT fix (2026-10-14): this used to be a direct `.from("rsvp_responses")
  // .insert()/.upsert()` -- confirmed live that real guests could not submit
  // RSVPs at all, Supabase's own API Gateway logs showed every POST/PATCH
  // straight to a table's REST endpoint being rejected (401) for the anon
  // role before ever reaching PostgREST or Postgres (0 logs on either), a
  // platform-side issue outside this app's control. RPC calls through the
  // same gateway keep working fine for anon (confirmed: find_or_create_self_
  // service_guest, lookup_guest_by_invite_code, check_and_log_rsvp_submission
  // above all still succeed) -- routing the actual write through a security-
  // definer RPC instead routes around the broken path entirely. See
  // submit_rsvp_response's own migration comment for the full diagnosis.
  // Also absorbs the guest_attendees sync, previously two more direct-table
  // calls (delete-then-insert) right below this, equally broken -- the RPC
  // does both in one transaction now.
  const { error } = await supabase.rpc("submit_rsvp_response", {
    p_event_id: eventId,
    p_guest_id: resolvedGuestId,
    p_guest_name: input.guestName,
    p_attending: input.attending,
    p_party_size: input.attending ? partySize : 0,
    p_allergies: input.allergies || null,
    p_comment: input.comment || null,
    // Reused rather than adding a new column — this held a fixed
    // "meal preferences" concept that was never wired up anywhere in the
    // app; a generic questionId -> answer map covers meal prefs and any
    // other custom RSVP question the host defines (drinks, transfer,
    // lodging, etc.) without a migration.
    p_meal_preferences: input.answers ? (input.answers as unknown as Json) : null,
    p_attendee_names: input.attendeeNames && input.attendeeNames.length > 0 ? input.attendeeNames : null,
  });

  if (error) {
    console.error("submitRsvp failed", error);
    if (error.message?.includes("EVENT_NOT_PUBLISHED")) {
      return { ok: false, message: t.notPublishedError };
    }
    return { ok: false, message: t.submitFailedError };
  }

  // Best-effort confirmation email -- never blocks or fails the RSVP itself.
  // Only guests resolved to a real `guests` row can have an email on file
  // (the public RSVP form itself never asks for one); most self-service
  // guests won't, and that's fine, there's just nothing to send to.
  if (resolvedGuestId) {
    try {
      const { data: guestEmail } = await supabase.rpc("get_guest_email_for_rsvp_confirmation", {
        p_event_id: eventId,
        p_guest_id: resolvedGuestId,
      });

      if (guestEmail) {
        const { data: event } = await supabase.from("events").select("title").eq("id", eventId).single();
        const eventTitle = event?.title ?? "the event";

        // Uses `locale` (the guest's own resolved page-view language, same
        // one driving `t.rsvp` above) rather than the event's default_locale
        // -- this confirmation is a direct reply to an action the guest just
        // took in their own chosen language, which is the more accurate
        // signal than the host's own event-setup language for this one email.
        const guestT = getDictionary(locale).email;
        const safeGuestName = escapeHtml(input.guestName);
        const safeEventTitle = escapeHtml(eventTitle);
        const html = input.attending
          ? guestT.guestConfirmation.acceptedBody(safeGuestName, safeEventTitle)
          : guestT.guestConfirmation.declinedBody(safeGuestName, safeEventTitle);

        await sendEmail({
          to: guestEmail,
          subject: input.attending
            ? guestT.guestConfirmation.acceptedSubject(eventTitle)
            : guestT.guestConfirmation.declinedSubject(eventTitle),
          html,
        });
      }
    } catch (emailError) {
      console.error("submitRsvp confirmation email failed", emailError);
    }
  }

  // Best-effort host notification -- direct feedback: a host had no way to
  // know a guest RSVP'd besides checking the dashboard themselves. Runs
  // independently of the guest confirmation above (that one only fires for
  // guests with an email on file; the host should hear about every RSVP,
  // including self-service ones with no guest email at all). Same
  // security-definer lookup pattern as the guest email above -- this action
  // runs with no session (anon RSVP form), so the host's email can't be read
  // through a normal RLS-scoped query.
  try {
    // Checked before the RPC call (not just skipped at send time) so a host
    // who turned this off doesn't pay for the lookup either -- see
    // guests/RsvpNotificationToggle.tsx for where this gets flipped.
    const { data: notificationEvent } = await supabase
      .from("events")
      .select("title, rsvp_email_notifications, default_locale")
      .eq("id", eventId)
      .single();

    // Defaults to on (matches the column's own DB default) if the select
    // above came back empty -- e.g. the 20260930130000 migration adding
    // this column hasn't been applied by hand yet -- rather than silently
    // going quiet instead of notifying the host.
    const { data: ownerEmail } = notificationEvent?.rsvp_email_notifications !== false
      ? await supabase.rpc("get_event_owner_email_for_rsvp_notification", { p_event_id: eventId })
      : { data: null };

    if (ownerEmail) {
      const eventTitle = notificationEvent?.title ?? "your event";
      // The host's own language: this is a notification ABOUT the event,
      // sent to whoever set it up, not a reply to this guest's own
      // page-view locale -- same reasoning as guestT above resolves the
      // opposite direction correctly for the guest's own confirmation.
      const hostT = getDictionary(resolveEmailLocale(notificationEvent?.default_locale)).email;

      // Direct feedback: a host had to open the dashboard to see where RSVPs
      // stood overall -- this one extra query turns every instant email into
      // a running scoreboard, not just a single-guest notice. Counted fresh
      // on each send rather than cached, so it's always accurate even if two
      // RSVPs land close together.
      const { data: allResponses } = await supabase
        .from("rsvp_responses")
        .select("attending")
        .eq("event_id", eventId);
      const totalResponded = allResponses?.length ?? 0;
      const totalYes = allResponses?.filter((response) => response.attending).length ?? 0;
      const totalNo = totalResponded - totalYes;
      const summaryLine = totalResponded > 0 ? hostT.hostNewRsvp.responseSummary(totalResponded, totalYes, totalNo) : "";

      // "A guest" fallback stays English regardless of host locale -- the
      // RSVP form already requires a name (form-strategy audit, 2026-10-09),
      // so this path is defensive/effectively unreachable, not a real
      // user-facing string worth its own 8-locale dictionary entry.
      const guestName = input.guestName || "A guest";
      // Every value here is guest-submitted, free-text, and lands in the
      // host's inbox inside a support@invimbo.com-signed email -- escape
      // all of it before interpolation (security-review, 2026-10-12;
      // VULN-001). eventTitle is host-controlled, not guest-controlled,
      // but escaped too for consistency/defense in depth at near-zero cost.
      const safeGuestName = escapeHtml(guestName);
      const safeEventTitle = escapeHtml(eventTitle);
      const detailLines = [
        hostT.hostNewRsvp.headline(safeGuestName, safeEventTitle, input.attending),
        summaryLine,
        input.attending ? hostT.hostNewRsvp.partySize(partySize) : "",
        input.attending && input.attendeeNames?.length
          ? hostT.hostNewRsvp.namesLabel(escapeHtml(input.attendeeNames.filter(Boolean).join(", ")))
          : "",
        input.allergies ? hostT.hostNewRsvp.allergiesLabel(escapeHtml(input.allergies)) : "",
        input.comment ? hostT.hostNewRsvp.messageLabel(escapeHtml(input.comment)) : "",
      ].filter(Boolean);

      await sendEmail({
        to: ownerEmail,
        // Plain text, not HTML -- uses the raw guestName, not safeGuestName
        // (HTML-escaping would literally put "&#39;" etc. into the subject
        // line for a name with an apostrophe).
        subject: input.attending
          ? hostT.hostNewRsvp.acceptedSubject(guestName)
          : hostT.hostNewRsvp.declinedSubject(guestName),
        html: detailLines.join(""),
      });
    }
  } catch (emailError) {
    console.error("submitRsvp host notification email failed", emailError);
  }

  return { ok: true };
}

export async function lookupGuestTable(eventId: string, fullName: string): Promise<BanquetTableLookupResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("lookup_guest_table_by_name", { p_event_id: eventId, p_full_name: fullName })
    .maybeSingle();

  // A real RPC/DB failure used to be folded into the same `{found: false}`
  // shape as a legitimate "no match" -- SimpleLookup's catch block only
  // triggers on a thrown error, so a guest hitting an actual outage saw
  // "we couldn't find you on the guest list, check your spelling" instead
  // of "something went wrong, try again" -- wrong advice for the real
  // problem. `!data` alone (the RPC ran fine, zero rows) is still a
  // genuine not-found, not an error.
  if (error) {
    console.error("lookupGuestTable failed", error);
    throw new Error("Lookup failed");
  }
  if (!data) {
    return { found: false, tableName: null, attending: null };
  }

  return { found: data.found, tableName: data.table_name, attending: data.attending };
}

/** Verifies the guest-entered password against the event's hash entirely
 * inside the `verify_site_password` Postgres function -- the hash itself is
 * never read here (its column-level SELECT is revoked for every role; see
 * the site-password migration), only the opaque unlock token the function
 * returns on a correct guess. That token becomes the cookie value page.tsx
 * checks on future visits, so the guest isn't asked again. */
export async function unlockSitePassword(
  eventId: string,
  password: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();

  // Security audit (2026-10-16): this RPC is a password check callable
  // directly by anyone, with nothing stopping a script from guessing
  // repeatedly -- same rate-limit gap already closed for submitRsvp, same
  // IP-header reasoning/fails-open philosophy (an RPC-error or missing-IP
  // case only skips logging for this one attempt, never blocks a real
  // guest's own retry).
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() || headerList.get("x-real-ip");
  if (ipAddress) {
    const { data: withinLimit, error: rateLimitError } = await supabase.rpc(
      "check_and_log_site_password_attempt",
      { p_event_id: eventId, p_ip_address: ipAddress }
    );
    if (rateLimitError) {
      console.error("unlockSitePassword rate-limit check failed", rateLimitError);
    } else if (withinLimit === false) {
      return { ok: false, message: "Too many attempts -- please try again later" };
    }
  } else {
    console.warn("unlockSitePassword: no client IP header present, skipping rate limit for this request");
  }

  const { data: token, error } = await supabase.rpc("verify_site_password", {
    p_event_id: eventId,
    p_password: password,
  });

  if (error || !token) {
    return { ok: false, message: "Incorrect password" };
  }

  const cookieStore = await cookies();
  cookieStore.set(`site_unlock_${eventId}`, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180, // 180 days
  });
  return { ok: true };
}
