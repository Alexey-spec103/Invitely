"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { plans, DEFAULT_PLAN_ID } from "@/lib/plans";
import { updatePlan, createCheckoutSession } from "./actions";

interface PlanSelectFormProps {
  eventId: string;
  currentPlanId: string;
}

export default function PlanSelectForm({ eventId, currentPlanId }: PlanSelectFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState(currentPlanId);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Stripe redirects back here with ?checkout=success once payment
  // completes -- the actual plan_id write happens separately, in the
  // webhook (it's the only side that knows payment truly succeeded), so
  // this is purely a "thanks, hang on" message while that lands; refresh
  // once to pick it up in case the webhook beat the redirect back.
  const checkoutStatus = searchParams.get("checkout");
  useEffect(() => {
    if (checkoutStatus === "success") {
      router.refresh();
    }
  }, [checkoutStatus, router]);

  const handleSelect = (planId: string) => {
    setError(null);

    if (planId === DEFAULT_PLAN_ID) {
      setSelected(planId);
      startTransition(async () => {
        const result = await updatePlan({ eventId, planId });
        if (result.ok) {
          router.refresh();
        } else {
          setError(result.message);
        }
      });
      return;
    }

    // Paid plans go through Stripe Checkout, not a direct DB write --
    // navigating away mid-transition is fine, so this doesn't touch
    // `selected` (a plan the host hasn't actually paid for yet shouldn't
    // show as chosen while they're still on the Stripe page).
    startTransition(async () => {
      const result = await createCheckoutSession({ eventId, planId });
      if (result.ok) {
        window.location.href = result.url;
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <div>
      <h1 className="dash-h1 text-gray-900">Plan</h1>
      <p className="mt-1 text-sm text-gray-500">Choose the plan that fits, free to switch anytime.</p>

      {/* dashboard-audit.md B20's original honesty concern (no real payment
          processing, so a card-network badge here would be a false trust
          claim) is resolved now that paid plans actually go through Stripe
          Checkout -- swapped for a real Stripe mention instead of removing
          the badge outright, so the trust signal stays but now points at
          something true. */}
      <span className="mt-4 inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600">
        🔒 Paid plans are processed securely by Stripe
      </span>

      {checkoutStatus === "success" && (
        <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Payment received — your plan will update in a moment.
        </p>
      )}
      {checkoutStatus === "cancelled" && (
        <p className="mt-3 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
          Checkout cancelled — nothing was charged.
        </p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {Object.values(plans).map((plan) => {
          const isSelected = plan.id === selected;
          return (
            <div
              key={plan.id}
              className={
                isSelected
                  ? "rounded-2xl border-2 border-[var(--dash-accent)] bg-white p-5 shadow-sm"
                  : "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              }
            >
              <p className="text-sm font-semibold text-gray-900">{plan.name}</p>
              <p
                className={
                  isSelected
                    ? "mt-1 text-2xl font-semibold text-[var(--dash-accent-text)]"
                    : "mt-1 text-2xl font-semibold text-gray-900"
                }
              >
                {plan.priceEur === 0 ? "Free" : `€${plan.priceEur}`}
              </p>
              <ul className="mt-4 space-y-2 text-xs text-gray-600">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSelect(plan.id)}
                className={
                  isSelected
                    ? "dash-btn dash-btn-secondary mt-5 w-full"
                    : "dash-btn dash-btn-primary mt-5 w-full"
                }
              >
                {isSelected
                  ? "Selected"
                  : plan.priceEur === 0
                    ? "Select"
                    : isPending
                      ? "Redirecting…"
                      : `Upgrade — €${plan.priceEur}`}
              </button>
            </div>
          );
        })}
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
