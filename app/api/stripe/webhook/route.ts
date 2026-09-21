import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";
import { plans } from "@/lib/plans";

/** Stripe calls this server-to-server with no cookies/session, so the
 * request body must be read raw (unparsed) for `stripe.webhooks.
 * constructEvent` to verify the signature -- Next.js's Route Handlers give
 * you the raw body via `request.text()` as long as nothing upstream has
 * already consumed/parsed it, which is true here since this route does
 * nothing else with the body first. */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await request.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const eventId = session.metadata?.eventId;
    const planId = session.metadata?.planId;

    // Both are set by createCheckoutSession (app/dashboard/[eventId]/plan/
    // actions.ts) on every session this app creates -- if either is
    // missing, this checkout wasn't one of ours (or metadata got stripped
    // somehow); skip rather than guess. Re-validate planId against the
    // real plan table rather than trusting the string from Stripe's
    // payload directly, same reasoning as any other external input.
    if (eventId && planId && plans[planId]) {
      const supabase = createServiceClient();
      const { error } = await supabase
        .from("events")
        .update({ plan_id: planId })
        .eq("id", eventId);

      if (error) {
        // Log and 500 so Stripe retries -- silently dropping a paid
        // upgrade because of a transient DB error is worse than a
        // duplicate retry (the update is idempotent: setting the same
        // plan_id twice is harmless).
        console.error("Stripe webhook: failed to upgrade plan", error);
        return NextResponse.json({ error: "Failed to apply plan" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
