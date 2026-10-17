"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { ONBOARDING_DRAFT_KEY } from "@/app/onboarding/OnboardingWizard";

/** Direct product-owner feedback (2026-10-17): "+ New event" used to be one
 * plain <option> buried inside EventSwitcher's own dropdown -- easy to miss,
 * and visually identical to just switching between existing events rather
 * than reading as its own distinct action. A separate, on-brand pill button
 * (same accent-filled shape as this header's other primary actions) makes
 * "make another one" a first-class thing to notice, not a hidden menu item.
 *
 * Also fixes a real bug the same feedback surfaced: clicking this used to
 * sometimes skip straight past "what are you celebrating?" into
 * wedding-specific fields. Root cause -- OnboardingWizard's own
 * resume-an-abandoned-draft mechanism (useful for a visitor who closed the
 * tab mid-wizard) has no way to tell "I'm resuming my own interrupted
 * attempt" apart from "I already have a real event and deliberately want a
 * fresh one" -- both just land on bare /onboarding. Clearing the draft here,
 * right before navigating, means a deliberate "+ New event" click always
 * starts clean at step 1, while a genuine abandoned-session visitor
 * (arriving some other way, e.g. a bookmarked /onboarding link) still gets
 * their progress back exactly as before -- this button is the only thing
 * that proactively clears it. */
export default function NewEventButton() {
  const router = useRouter();

  const handleClick = () => {
    try {
      localStorage.removeItem(ONBOARDING_DRAFT_KEY);
    } catch {
      // Private-browsing/restricted storage -- same "treat as no draft"
      // fallback OnboardingWizard's own reader already uses.
    }
    router.push("/onboarding");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex h-9 items-center gap-1.5 rounded-full bg-[var(--dash-accent)] px-4 text-sm font-semibold text-[var(--dash-accent-contrast)] transition hover:bg-[var(--dash-accent-hover)]"
    >
      <Plus className="h-[16px] w-[16px] shrink-0" strokeWidth={2.5} />
      <span className="whitespace-nowrap">Create another event</span>
    </button>
  );
}
