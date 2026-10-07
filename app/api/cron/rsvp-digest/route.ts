import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email";

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
  if (request.headers.get("authorization") !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: events, error } = await supabase
    .from("events")
    .select("id, title, owner_id, last_digest_sent_at")
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

    const { data: userResult, error: userError } = await supabase.auth.admin.getUserById(event.owner_id);
    const ownerEmail = userResult?.user?.email;
    if (userError || !ownerEmail) {
      console.error(`rsvp-digest: no owner email for event ${event.id}`, userError);
      continue;
    }

    const rows = newResponses
      .map((response) => `<li>${response.guest_name || "A guest"} — ${response.attending ? "yes" : "no"}</li>`)
      .join("");

    const html = [
      `<p>${newResponses.length} new response${newResponses.length === 1 ? "" : "s"} for <strong>${event.title}</strong> since your last update:</p>`,
      `<ul>${rows}</ul>`,
      `<p style="color:#6b7280;font-size:13px;">Running total: ${totalResponded} responded, ${totalYes} yes, ${totalNo} no.</p>`,
    ].join("");

    try {
      await sendEmail({
        to: ownerEmail,
        subject: `RSVP summary: ${newResponses.length} new response${newResponses.length === 1 ? "" : "s"} for ${event.title}`,
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
      console.error(`rsvp-digest: send failed for event ${event.id}`, emailError);
    }
  }

  return NextResponse.json({ ok: true, eventsConsidered: events?.length ?? 0, eventsEmailed });
}
