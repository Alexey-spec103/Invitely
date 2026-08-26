"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TourStep {
  title: string;
  body: string;
}

interface FirstVisitTourProps {
  /** Scopes the "seen it" flag in localStorage -- use a different id per
   * distinct tour (e.g. "site-editor", "onboarding") so they don't collide. */
  tourId: string;
  steps: TourStep[];
}

/** A small, skippable, illustration-free coachmark sequence shown once per
 * browser on first visit to a given screen -- the same "layered contextual
 * onboarding" pattern weddingpost.ru uses (a separate short tour per screen,
 * not one global tutorial). Floats bottom-right rather than anchoring to
 * specific DOM elements, which stays robust across section-order changes and
 * doesn't need per-element positioning math. */
export default function FirstVisitTour({ tourId, steps }: FirstVisitTourProps) {
  const storageKey = `invitely:tourSeen:${tourId}`;
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        if (!localStorage.getItem(storageKey)) {
          setVisible(true);
        }
      } catch {
        // Private-browsing/storage-restricted contexts: just skip the tour.
      }
    }, 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const current = steps[step];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-50 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-lg"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900">{current.title}</p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 text-gray-400 hover:text-gray-600"
          aria-label="Close tour"
        >
          ×
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
  );
}
