"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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

  // Direct feedback: this used to always render as a quiet grey pill reading
  // "Free plan" -- true, but it buried the one thing a host on Free actually
  // needs to notice (there's a real, better result one click away) behind
  // wording that reads as a status label, not an action. A host who has
  // already paid doesn't need upselling every time they glance at the
  // header, so only the free tier gets the bright treatment; Basic/Premium
  // keep the original quiet "X plan" pill.
  //
  // Direct feedback round 2: this pill used to read "Get your link — €19",
  // sitting right next to DashboardShell's own new, plan-independent "Copy
  // your link" button -- publishing for free was never actually gated on
  // payment (PublishToggle/PlanSelectForm), so the two controls side by side
  // contradicted each other. "Upgrade your link" keeps the same urgency
  // without implying a host needs to pay before they have any link at all.
  const isFree = plan.id === DEFAULT_PLAN_ID;
  const basicPrice = plans.basic?.priceEur ?? 19;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={
          isFree
            ? "flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--dash-accent)] px-3.5 text-xs font-bold text-[var(--dash-accent-contrast)] shadow-[0_6px_16px_rgba(255,107,69,0.35)] transition hover:bg-[var(--dash-accent-hover)]"
            : "flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--dash-border)] px-3 text-xs font-semibold text-[var(--dash-text-muted)] transition hover:border-[var(--dash-accent)] hover:text-[var(--dash-text)]"
        }
      >
        {isFree ? (
          <>
            {/* Same hidden-on-mobile/shown-from-sm pattern the sibling "See
                what guests see" link already uses in DashboardShell --
                without it, this button's full text wraps across 3 lines
                inside its fixed h-9 height once the header row's squeezed
                for space on a narrow screen, clipping "Upgrade" off the top
                (confirmed via a real mobile-width check). */}
            <span className="sm:hidden">Upgrade — €{basicPrice}</span>
            <span className="hidden sm:inline">Upgrade your link — €{basicPrice}</span>
          </>
        ) : (
          `${plan.name} plan`
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-60 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-2 text-[var(--dash-text)] shadow-[0_16px_48px_rgba(0,0,0,0.35)]">
          {/* impeccable critique P1 follow-up: this used to repeat each
              tier's full feature list, near-verbatim duplicating the Plan
              page's own (richer, in-context) version of the same content.
              Just the name/price/current-tier comparison stays here -- still
              genuinely useful at a glance -- and "See plan details" is the
              one link to where that full list actually lives, instead of
              re-explaining it a second time. */}
          {(Object.values(plans) as (typeof plans)[string][]).map((tier) => (
            <div
              key={tier.id}
              className={
                tier.id === plan.id
                  ? "flex items-center gap-2 rounded-lg bg-[var(--dash-accent)]/10 px-2.5 py-1.5"
                  : "flex items-center gap-2 px-2.5 py-1.5"
              }
            >
              <span className="text-sm font-medium">{tier.name}</span>
              {tier.id === plan.id && (
                <span className="rounded-full bg-[var(--dash-accent)]/15 px-2 py-0.5 text-[10px] font-medium text-[var(--dash-accent)]">
                  Current
                </span>
              )}
              <span className="ml-auto text-xs text-[var(--dash-text-muted)]">
                {tier.priceEur === 0 ? "Free" : `€${tier.priceEur}`}
              </span>
            </div>
          ))}
          <Link
            href={`/dashboard/${eventId}/plan`}
            onClick={() => setOpen(false)}
            className="dash-btn dash-btn-primary mt-2 w-full justify-center text-sm"
          >
            {plan.id === "premium" ? "Manage plan" : "See plan details"}
          </Link>
        </div>
      )}
    </div>
  );
}
