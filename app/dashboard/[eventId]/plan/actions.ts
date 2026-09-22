"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { requireRealUser } from "@/lib/session";
import { plans, DEFAULT_PLAN_ID } from "@/lib/plans";
import { getStripeClient } from "@/lib/stripe";

interface UpdatePlanInput {
  eventId: string;
  planId: string;
}

/** Downgrade-only now -- see createCheckoutSession for how a paid plan is
 * actually reached. A plan with a price attached can no longer be set this
 * way: the DB write used to happen straight off this action with nothing
 * charged (dashboard-audit.md B20's own comment on PlanSelectForm called
 * this out explicitly -- "we have no real payment processing behind these
 * 'Select' buttons"), which meant any signed-in owner could set their own
 * event to Premium for free. Free is still a legitimate no-payment
 * transition (cancelling), so it stays here. */
export async function updatePlan(
  input: UpdatePlanInput
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (input.planId !== DEFAULT_PLAN_ID) {
    return { ok: false, message: "Paid plans are purchased through checkout, not set directly" };
  }

  let user;
  try {
    user = await requireRealUser();
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Not authenticated" };
  }
  const supabase = await createClient();

  const { error } = await supabase
    .from("events")
    .update({ plan_id: input.planId })
    .eq("id", input.eventId)
    .eq("owner_id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath(`/dashboard/${input.eventId}/plan`);
  return { ok: true };
}

interface CreateCheckoutSessionInput {
  eventId: string;
  planId: string;
}

/** One-time payment per event, not a subscription -- matches this
 * product's own plan shape (lib/plans.ts's priceEur is a flat one-off
 * amount, there's no billing-interval concept anywhere else in the
 * codebase) and the "pay once for this wedding's site" mental model a host
 * actually has, rather than a recurring charge for a site they'll stop
 * needing right after the event. `metadata.eventId`/`planId` is how the
 * webhook (app/api/stripe/webhook/route.ts) knows what to upgrade once
 * Stripe confirms payment -- there's no user session by the time that
 * fires, so this is the only place that link gets made. */
export async function createCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  const plan = plans[input.planId];
  if (!plan || plan.priceEur <= 0) {
    return { ok: false, message: "Unknown paid plan" };
  }

  let user;
  try {
    user = await requireRealUser();
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Not authenticated" };
  }
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select("id, title, plan_id")
    .eq("id", input.eventId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error || !event) {
    return { ok: false, message: "Event not found" };
  }

  const headerList = await headers();
  const origin =
    headerList.get("origin") ??
    `https://${headerList.get("x-forwarded-host") ?? headerList.get("host")}`;

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: Math.round(plan.priceEur * 100),
          product_data: {
            name: `Invitely ${plan.name} — ${event.title}`,
            description: plan.features.join(" · "),
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      eventId: event.id,
      planId: plan.id,
    },
    success_url: `${origin}/dashboard/${event.id}/plan?checkout=success`,
    cancel_url: `${origin}/dashboard/${event.id}/plan?checkout=cancelled`,
  });

  if (!session.url) {
    return { ok: false, message: "Failed to create checkout session" };
  }

  return { ok: true, url: session.url };
}
