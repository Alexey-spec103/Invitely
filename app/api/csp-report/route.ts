import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

/** security-baseline audit (2026-10-19): the collection endpoint for
 * next.config.ts's Content-Security-Policy-Report-Only header's
 * `report-uri` -- browsers POST a JSON blob here whenever a response
 * violates the policy (nothing is blocked yet, this is the observation
 * phase the security-baseline skill's own CSP rollout guidance calls for:
 * "start with Report-Only... watch for legitimate violations... tune the
 * policy... switch to enforcing once violations are mostly false
 * positives"). Routed into Sentry (same "don't let a real signal go
 * nowhere but Vercel's raw logs" reasoning already applied to the Stripe
 * webhook and RSVP email failure paths this session) rather than a bespoke
 * dashboard -- this is a low-volume, occasional signal, not something that
 * needs its own storage.
 *
 * No auth/rate-limit here on purpose: this is the one endpoint ANY browser
 * anywhere is expected to POST to unprompted (the whole mechanism depends
 * on that), and the payload is browser-supplied diagnostic data already
 * sent over HTTP with no user session attached -- there's nothing this
 * could leak or corrupt. Report format is `application/csp-report` (legacy,
 * what Chrome/Firefox still send for `report-uri`) wrapping the real
 * payload in a "csp-report" key. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const report = body["csp-report"] ?? body;
    Sentry.captureMessage("CSP violation (report-only)", {
      level: "info",
      extra: { report },
    });
  } catch (error) {
    // A malformed report body is itself not actionable -- log and move on,
    // never let this endpoint itself throw back at the reporting browser.
    console.error("csp-report: failed to parse report body", error);
  }
  return new NextResponse(null, { status: 204 });
}
