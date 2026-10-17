import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import * as Sentry from "@sentry/nextjs";
import { getStripeClient } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";
import { plans, DEFAULT_PLAN_ID } from "@/lib/plans";

type SupabaseServiceClient = ReturnType<typeof createServiceClient>;

function paymentIntentIdOf(value: string | Stripe.PaymentIntent | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

/** The one place a refund or lost dispute reverses a paid upgrade --
 * matches on stripe_payment_intent_id (set below, when checkout completes)
 * rather than eventId, since neither the charge nor dispute payload carries
 * our own metadata (that only lives on the Checkout Session). Downgrades to
 * Free rather than deleting anything -- the event and its content stay
 * intact, same as any other plan change, just gated back down. */
async function downgradeEventByPaymentIntent(
  supabase: SupabaseServiceClient,
  paymentIntentId: string,
  reason: string,
  stripeEventId: string
) {
  const { data: event, error: lookupError } = await supabase
    .from("events")
    .select("id, plan_id")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (lookupError) {
    console.error("Stripe webhook: failed to look up event for refund/dispute", lookupError);
    Sentry.captureException(lookupError, { extra: { paymentIntentId, reason, stripeEventId } });
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }

  // No match is expected, not an error: the same payment_intent_id gets
  // cleared the first time this fires, so a duplicate webhook delivery (or
  // a refund on a since-upgraded-again event) naturally no-ops here.
  if (!event) {
    return NextResponse.json({ received: true });
  }

  const { error: updateError } = await supabase
    .from("events")
    .update({ plan_id: DEFAULT_PLAN_ID, stripe_payment_intent_id: null })
    .eq("id", event.id);

  if (updateError) {
    console.error("Stripe webhook: failed to downgrade plan after refund/dispute", updateError);
    Sentry.captureException(updateError, {
      extra: { eventId: event.id, paymentIntentId, reason, stripeEventId },
    });
    return NextResponse.json({ error: "Failed to downgrade plan" }, { status: 500 });
  }

  // Always worth knowing about, even though nothing failed -- money came
  // back out after a plan was unlocked, which is exactly the kind of thing
  // that should be visible somewhere other than Vercel's raw logs.
  Sentry.captureMessage(`Stripe: downgraded event ${event.id} to Free (${reason})`, {
    level: "info",
    extra: { eventId: event.id, previousPlanId: event.plan_id, paymentIntentId, stripeEventId },
  });

  return NextResponse.json({ received: true });
}

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
    //
    // payment_status check is defense-in-depth: createCheckoutSession never
    // sets payment_method_types (defaults to card-only, which always
    // settles synchronously), so in practice this event never fires with
    // anything but "paid" today. But `checkout.session.completed` also
    // fires for async payment methods (e.g. SEPA debit) while still
    // "unpaid" -- if an async method is ever enabled from the Stripe
    // Dashboard without a matching code change here, this is what stops a
    // plan from unlocking before money has actually arrived.
    if (eventId && planId && plans[planId] && session.payment_status === "paid") {
      const supabase = createServiceClient();
      const { error } = await supabase
        .from("events")
        .update({ plan_id: planId, stripe_payment_intent_id: paymentIntentIdOf(session.payment_intent) })
        .eq("id", eventId);

      if (error) {
        // Log and 500 so Stripe retries -- silently dropping a paid
        // upgrade because of a transient DB error is worse than a
        // duplicate retry (the update is idempotent: setting the same
        // plan_id twice is harmless). console.error alone never reaches
        // Sentry here -- sentry.server.config.ts inits with no console
        // integration, so only uncaught throws are auto-captured, not a
        // handled error branch like this one -- without this, a failed
        // paid upgrade was silent beyond Vercel's own logs.
        console.error("Stripe webhook: failed to upgrade plan", error);
        Sentry.captureException(error, {
          extra: { eventId, planId, stripeEventId: event.id },
        });
        return NextResponse.json({ error: "Failed to apply plan" }, { status: 500 });
      }
    }
    return NextResponse.json({ received: true });
  }

  // Stripe sets Charge.refunded = true only once the charge is refunded in
  // full (a partial refund -- e.g. a goodwill gesture -- leaves it false
  // and shouldn't revoke anything the host already paid in full for).
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    if (!charge.refunded) {
      return NextResponse.json({ received: true });
    }
    const paymentIntentId = paymentIntentIdOf(charge.payment_intent);
    if (!paymentIntentId) {
      return NextResponse.json({ received: true });
    }
    return downgradeEventByPaymentIntent(createServiceClient(), paymentIntentId, "full refund", event.id);
  }

  // A dispute being opened doesn't mean the merchant loses it -- downgrading
  // immediately would punish a host mid-dispute over a charge that might
  // still be ruled in our favor. This is a visibility alert only (so a
  // human can see it and respond to Stripe), not an automatic downgrade.
  if (event.type === "charge.dispute.created") {
    const dispute = event.data.object as Stripe.Dispute;
    Sentry.captureMessage(`Stripe: dispute opened on charge ${dispute.charge}`, {
      level: "warning",
      extra: { disputeId: dispute.id, paymentIntentId: paymentIntentIdOf(dispute.payment_intent), stripeEventId: event.id },
    });
    return NextResponse.json({ received: true });
  }

  // The definitive outcome: "lost" means Stripe has already debited the
  // funds back to the cardholder's bank, same as a refund -- "won" (or any
  // other closed status) means nothing changes, the charge stands.
  if (event.type === "charge.dispute.closed") {
    const dispute = event.data.object as Stripe.Dispute;
    if (dispute.status !== "lost") {
      return NextResponse.json({ received: true });
    }
    const paymentIntentId = paymentIntentIdOf(dispute.payment_intent);
    if (!paymentIntentId) {
      return NextResponse.json({ received: true });
    }
    return downgradeEventByPaymentIntent(createServiceClient(), paymentIntentId, "lost dispute", event.id);
  }

  return NextResponse.json({ received: true });
}
