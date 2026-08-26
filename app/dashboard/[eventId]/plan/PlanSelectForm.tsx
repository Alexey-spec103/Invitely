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
      <h1 className="text-xl font-semibold text-gray-900">Plan</h1>
      <p className="mt-1 text-sm text-gray-500">
        No payment is collected yet — this just sets your plan.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {Object.values(plans).map((plan) => {
          const isSelected = plan.id === selected;
          return (
            <div
              key={plan.id}
              className={
                isSelected
                  ? "rounded-xl border-2 border-rose-600 p-5"
                  : "rounded-xl border border-gray-200 p-5"
              }
            >
              <p className="text-sm font-semibold text-gray-900">{plan.name}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
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
                    ? "mt-5 w-full rounded-md bg-rose-100 px-3 py-2 text-sm font-medium text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    : "mt-5 w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
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
