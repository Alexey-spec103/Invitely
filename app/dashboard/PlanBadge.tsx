"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { plans, DEFAULT_PLAN_ID } from "@/lib/plans";

interface PlanBadgeProps {
  planId: string;
  eventId: string;
}

/** A host's current plan lived only inside UserMenu's dropdown -- easy to
 * never notice while actually working in the constructor, where "what am I
 * paying for / what would upgrading get me" matters most. This is a small,
 * always-visible pill in the header (name only, no price, no urgency
 * styling) that opens a compact comparison on click -- informative, not a
 * naggy upsell. Every plan-gated spot in the dashboard (SectionModulesPanel,
 * Paper's watermark note/modal) still does its own thing at the point of
 * use; this is just the one place a host can check their status at a
 * glance. */
export default function PlanBadge({ planId, eventId }: PlanBadgeProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const plan = plans[planId] ?? plans[DEFAULT_PLAN_ID];

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--dash-border)] px-3 text-xs font-semibold text-[var(--dash-text-muted)] transition hover:border-[var(--dash-accent)] hover:text-[var(--dash-text)]"
      >
        {plan.name} plan
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 text-[var(--dash-text)] shadow-[0_16px_48px_rgba(0,0,0,0.35)]">
          {(Object.values(plans) as (typeof plans)[string][]).map((tier) => (
            <div key={tier.id} className="border-b border-[var(--dash-border)] py-3 first:pt-0 last:border-b-0 last:pb-0">
              <p className="flex items-center gap-2 text-sm font-semibold">
                {tier.name}
                {tier.id === plan.id && (
                  <span className="rounded-full bg-[var(--dash-accent)]/15 px-2 py-0.5 text-[10px] font-medium text-[var(--dash-accent)]">
                    Current
                  </span>
                )}
                <span className="ml-auto text-xs font-normal text-[var(--dash-text-muted)]">
                  {tier.priceEur === 0 ? "Free" : `€${tier.priceEur}`}
                </span>
              </p>
              <ul className="mt-1.5 space-y-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-1.5 text-xs text-[var(--dash-text-muted)]">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-[var(--dash-accent)]" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <Link
            href={`/dashboard/${eventId}/plan`}
            onClick={() => setOpen(false)}
            className="dash-btn dash-btn-primary mt-3 w-full justify-center text-sm"
          >
            {plan.id === "premium" ? "Manage plan" : "Upgrade"}
          </Link>
        </div>
      )}
    </div>
  );
}
