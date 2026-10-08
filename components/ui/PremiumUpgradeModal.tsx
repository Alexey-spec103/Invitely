"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { plans } from "@/lib/plans";

interface PremiumUpgradeModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  /** What the host just tried to do, e.g. "Downloading the seating chart" --
   * filled into the modal's first line so it's obvious this fired because
   * of the exact action they took, not a generic upsell. */
  action: string;
  /** Which plan clears the gate -- defaults to Premium (the paper-watermark
   * gate this modal was first built for). SectionModulesPanel's Basic-gated
   * modules pass "basic" instead, since Basic already covers them. */
  targetPlanId?: string;
  /** Rest of the first sentence, right after `action`. Defaults to the
   * watermark gate's own wording. */
  consequence?: string;
  /** Rest of the "Upgrade to X (€Y) to ..." sentence. Defaults to the
   * watermark gate's own wording. */
  benefit?: string;
  /** Whether closing/continuing still lets the action happen (paper
   * downloads work watermarked on any plan) or the action is fully blocked
   * until upgrade. Changes the continue button's presence. */
  canContinueAnyway?: boolean;
  /** Label for the `canContinueAnyway` button. Defaults to the watermark
   * gate's own "Continue with watermark" -- callers for a different kind of
   * gate (e.g. a module that just won't publish yet) should pass their own,
   * since "watermark" means nothing outside the paper-download context. */
  continueLabel?: string;
  onContinueAnyway?: () => void;
}

/** dashboard-audit.md follow-up: previously a gated action (paper
 * downloads) only got a small passive caption below the button after the
 * fact -- easy to miss, and it never actually said "this needs payment."
 * Fires the moment the host clicks a gated action, states that plainly, and
 * names the plan that removes the gate -- matching the "sam находи что
 * нелогичное" ask to surface paid-feature boundaries immediately rather
 * than silently.
 *
 * Watermark-free paper/banquet downloads are a Premium-only feature --
 * Basic covers the digital site (custom domain, extra modules, no site
 * badge) but printable materials stay watermarked until Premium. */
export default function PremiumUpgradeModal({
  open,
  onClose,
  eventId,
  action,
  targetPlanId,
  consequence,
  benefit,
  canContinueAnyway,
  continueLabel,
  onContinueAnyway,
}: PremiumUpgradeModalProps) {
  const targetPlan = plans[targetPlanId ?? "premium"] ?? plans.premium;

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">🔒</span>
            <h2 className="dash-h2 text-base text-[var(--dash-accent)]">{targetPlan.name} feature</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
            title="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <p className="text-sm text-[var(--dash-text)]">
          {action} {consequence ?? 'adds a "Made with Invimbo" watermark on your current plan.'}
        </p>
        <p className="mt-2 text-sm text-[var(--dash-text-muted)]">
          Upgrade to <span className="font-semibold text-[var(--dash-text)]">{targetPlan.name}</span>{" "}
          (€{targetPlan.priceEur}) to {benefit ?? "remove it from every invitation and banquet card"}.
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <Link
            href={`/dashboard/${eventId}/plan`}
            className="dash-btn dash-btn-primary w-full justify-center"
          >
            Upgrade to {targetPlan.name}
          </Link>
          {canContinueAnyway ? (
            <button
              type="button"
              onClick={() => {
                onContinueAnyway?.();
                onClose();
              }}
              className="dash-btn dash-btn-neutral w-full justify-center text-sm"
            >
              {continueLabel ?? "Continue with watermark"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="dash-btn dash-btn-neutral w-full justify-center text-sm"
            >
              Not now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
