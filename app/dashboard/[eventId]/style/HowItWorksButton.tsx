"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

interface HowItWorksButtonProps {
  /** Optional, defaulting to English -- same convention as ModuleCard/
   * FirstVisitTour, so any not-yet-localized call site keeps working. */
  locale?: Locale;
}

/** dashboard-audit.md B5: weddingpost.ru's style catalog pairs its promise
 * headline with a "▶ как это работает?" pill that teaches the flow --
 * confirmed live, this is a short explainer, not a video (Invimbo has no
 * onboarding video to link to). A lightweight click-to-toggle popover, same
 * outside-click/Escape pattern as UserMenu, rather than a full modal --
 * three sentences don't need one. */
export default function HowItWorksButton({ locale }: HowItWorksButtonProps) {
  const t = getDictionary(locale ?? "en").dashboard.style.howItWorks;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="dash-btn dash-btn-neutral gap-1.5 px-3.5 py-1.5 text-xs"
      >
        <Play className="h-3 w-3 fill-current" aria-hidden="true" />
        {t.button}
      </button>

      {open && (
        <div
          role="dialog"
          className="absolute right-0 top-full z-20 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-4 text-left shadow-lg"
        >
          <p className="text-sm font-semibold text-gray-900">{t.heading}</p>
          <ol className="mt-2 space-y-1.5 text-sm text-gray-600">
            <li>1. {t.step1}</li>
            <li>2. {t.step2}</li>
            <li>3. {t.step3}</li>
          </ol>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 text-xs font-medium text-[var(--dash-accent-text)] hover:underline"
          >
            {t.gotIt}
          </button>
        </div>
      )}
    </div>
  );
}
