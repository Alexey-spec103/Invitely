"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { plans } from "@/lib/plans";
import { updatePlan } from "./actions";

interface PlanSelectFormProps {
  eventId: string;
  currentPlanId: string;
}

export default function PlanSelectForm({ eventId, currentPlanId }: PlanSelectFormProps) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentPlanId);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (planId: string) => {
    setSelected(planId);
    setError(null);
    startTransition(async () => {
      try {
        await updatePlan({ eventId, planId });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save");
      }
    });
  };

  return (
    <div>
      <h1 className="dash-h1 text-gray-900">Plan</h1>
      <p className="mt-1 text-sm text-gray-500">Choose the plan that fits, free to switch anytime.</p>

      {/* dashboard-audit.md B20: weddingpost.ru stations real Visa/
          MasterCard/PCI-DSS badges directly above its purchase button --
          we have no real payment processing behind these "Select" buttons
          (they just set plan_id, nothing is charged), so real card-network
          badges would be a false trust claim here, not a missing
          decoration. The honest equivalent: state plainly that nothing is
          charged, right above the buttons rather than quiet page-subtitle
          text. */}
      <span className="mt-4 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
        🔓 No payment collected
      </span>

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
                {isSelected ? "Selected" : "Select"}
              </button>
            </div>
          );
        })}
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
