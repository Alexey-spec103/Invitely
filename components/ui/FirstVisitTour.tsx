"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/components/usePrefersReducedMotion";

interface TourStep {
  title: string;
  body: string;
  /** CSS selector for the one real control this step is actually about --
   * e.g. "#site-modules-panel". When present and the element is found on
   * the page, the step scrolls it into view, draws a highlight ring around
   * it, and anchors the card next to it instead of the generic floating
   * corner. Omit for steps that are genuinely about the page as a whole
   * (a welcome message, "click any text to edit") rather than one widget --
   * forcing an anchor onto those would just be pointing at an arbitrary
   * spot, not a real improvement over the floating card. */
  targetSelector?: string;
}

interface FirstVisitTourProps {
  /** Scopes the "seen it" flag in localStorage -- use a different id per
   * distinct tour (e.g. "site-editor", "onboarding") so they don't collide. */
  tourId: string;
  steps: TourStep[];
}

const CARD_WIDTH = 320;
const CARD_GAP = 12;

/** A small, skippable coachmark sequence shown once per browser on first
 * visit to a given screen -- the same "layered contextual onboarding"
 * pattern weddingpost.ru uses (a separate short tour per screen, not one
 * global tutorial). impeccable critique 2026-10-04: the previous version
 * always floated bottom-right regardless of what a step was actually
 * talking about -- a step could say "turn modules on in the panel above"
 * while visually anchored nowhere near that panel, which only works if the
 * host already happens to have it in view. Steps that name one real,
 * findable control now scroll to it, ring-highlight it, and park the card
 * next to it; steps that are genuinely about the whole page (no single
 * widget to point at) keep the original floating-corner behavior, since
 * forcing an anchor onto those would just point at an arbitrary element
 * instead of the thing the copy is actually about. */
export default function FirstVisitTour({ tourId, steps }: FirstVisitTourProps) {
  const storageKey = `invitely:tourSeen:${tourId}`;
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    // impeccable critique P-adjacent: this used to pop in at `0ms -- the
    // same instant as the page's own first paint, right on top of whatever
    // else greets a first-time host there (Site's own feature carousel +
    // wedding-data reminder banner, confirmed live to all land together).
    // A couple seconds' breathing room lets the host's eyes land on the page
    // itself first; the tour then offers itself once, not simultaneously.
    const timeout = setTimeout(() => {
      try {
        if (!localStorage.getItem(storageKey)) {
          setVisible(true);
        }
      } catch {
        // Private-browsing/storage-restricted contexts: just skip the tour.
      }
    }, 2000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = steps[step];

  // Re-measures on every step change, and keeps measuring on scroll/resize
  // while a target is active -- the highlight ring is drawn from this rect,
  // not CSS position, so it has to track the real element through layout
  // shifts (e.g. another panel's own content loading in above it).
  useEffect(() => {
    if (!visible || !current?.targetSelector) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(current.targetSelector);
    if (!el) {
      setTargetRect(null);
      return;
    }
    // `el.scrollIntoView(...)` (tried first, both smooth and instant) never
    // actually scrolled the page in live testing -- confirmed via
    // `window.scrollY` staying 0 after calling it on a target ~2400px down a
    // ~3000px page, with the ring then measuring (correctly, just
    // uselessly) against the un-scrolled position, off-screen. Driving the
    // scroll explicitly with `window.scrollTo` -- computed from the
    // target's current viewport offset plus the page's current scroll
    // position, landing the target at roughly a third down the viewport --
    // sidesteps whatever silently swallowed the native call.
    const rectBeforeScroll = el.getBoundingClientRect();
    const desiredTop = rectBeforeScroll.top + window.scrollY - window.innerHeight / 3;
    window.scrollTo({ top: Math.max(0, desiredTop), behavior: "auto" });
    // Both `scrollIntoView` and `window.scrollTo` were confirmed live to
    // sometimes silently no-op (environment-specific -- couldn't pin down
    // why). A ring drawn around an element that's still off-screen is worse
    // than no ring at all: the host would see a dimmed page with no visible
    // highlight anywhere and no way to tell why. If the target is still
    // nowhere near the viewport once the scroll attempt has had time to
    // land, fall back to the plain floating card instead of a broken one.
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const reachedViewport = rect.bottom > -40 && rect.top < window.innerHeight + 40;
      setTargetRect(reachedViewport ? rect : null);
    };
    const settleTimeout = setTimeout(measure, 60);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(settleTimeout);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [visible, current?.targetSelector]);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      // Non-fatal -- worst case the tour reappears next visit.
    }
  };

  if (!visible) return null;

  const isLast = step === steps.length - 1;

  // Usability check (2026-10-14): CARD_WIDTH (320px) plus 16px margin on
  // each side needs a 352px-wide viewport to fit without clipping -- fine on
  // any phone from an iPhone SE 2nd-gen (375px) up, but the original
  // 320px-wide iPhone SE (still a real, if old, device) would have had this
  // card's left edge pushed off-screen. Capping to the actual viewport width
  // (minus margins) keeps it on-screen on anything that narrow instead.
  const effectiveCardWidth = Math.min(CARD_WIDTH, window.innerWidth - 32);

  // Anchored placement: park the card just below the target, clamped to
  // stay on-screen horizontally -- a fixed bottom-right card next to a
  // target near the top of a long page would put real visual distance
  // between the ring and the copy explaining it.
  const anchoredStyle = targetRect
    ? {
        position: "fixed" as const,
        top: Math.min(targetRect.bottom + CARD_GAP, window.innerHeight - 220),
        left: Math.min(
          Math.max(targetRect.left, 16),
          window.innerWidth - effectiveCardWidth - 16
        ),
        width: effectiveCardWidth,
      }
    : undefined;

  return (
    <>
      {targetRect && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-40 rounded-lg"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            // Both effects have to live in ONE box-shadow value -- a
            // Tailwind `ring-*` class and this inline style would both try
            // to own the `box-shadow` property, and the inline one wins,
            // silently erasing the ring (confirmed live: the dim-everything
            // layer rendered correctly on its own, but no ring was ever
            // visible). First layer is the rose ring itself (a solid-color
            // spread, since there's no element border to outline); second
            // is the page-wide dim, offset far enough out to cover the
            // viewport regardless of scroll position.
            boxShadow: "0 0 0 3px #e11d48, 0 0 0 9999px rgba(15, 15, 15, 0.55)",
          }}
        />
      )}
      <motion.div
        ref={cardRef}
        key={step}
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={
          targetRect
            ? "z-50 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-lg"
            : // Same narrow-viewport fix as the anchored branch above (see
              // effectiveCardWidth's comment) -- this one has no JS-computed
              // width to override w-80, so the cap is a pure-CSS max-width
              // instead: viewport width minus the 24px right gutter and a
              // matching 24px left margin.
              "fixed bottom-6 right-6 z-50 w-80 max-w-[calc(100vw-3rem)] rounded-xl border border-gray-200 bg-white p-4 shadow-lg"
        }
        style={anchoredStyle}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900">{current.title}</p>
          {/* Usability check (2026-10-14): this used to be a bare "×" glyph
              with no padding -- its real tappable area was just the
              character's own bounding box, well under the ~40px touch-target
              floor, and "×" alone doesn't actually say what it does (does it
              skip the whole tour, or just hide this one card until next
              visit?). It fully dismisses for good (see `dismiss` -- sets the
              localStorage flag immediately), so it should say so: explicit
              "Skip" text, plus enough padding around it to make a real
              mobile tap target. */}
          <button
            type="button"
            onClick={dismiss}
            className="-m-2 shrink-0 rounded px-2 py-2 text-xs font-medium text-gray-400 hover:text-gray-600"
            aria-label="Skip tour"
          >
            Skip
          </button>
        </div>
        <p className="mt-1.5 text-sm text-gray-600">{current.body}</p>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${i === step ? "bg-rose-600" : "bg-gray-200"}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="text-xs font-medium text-gray-500 hover:text-gray-800"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => (isLast ? dismiss() : setStep((s) => s + 1))}
              className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700"
            >
              {isLast ? "Got it" : "Next"}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
