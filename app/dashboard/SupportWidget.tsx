"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

interface SupportWidgetProps {
  /** Optional, defaulting to English -- see DashboardNav's matching prop
   * comment for why. */
  locale?: Locale;
}

/** dashboard-audit.md D5: weddingpost.ru keeps a round chat widget pinned in
 * the corner of every dashboard screen, backed by a real live-chat vendor.
 * We have no live-chat infrastructure, so this is the honest equivalent
 * (same call as B19's SupportCard): a persistent round button that opens a
 * small panel pointing at the one real support channel the app already
 * surfaces everywhere else (Terms, Privacy, landing, SupportCard) --
 * support@invimbo.com, read by a real person -- rather than faking a live
 * chat session that doesn't exist. Bottom-left (not bottom-right, where
 * FirstVisitTour already floats) so the two never overlap on a first visit. */
export default function SupportWidget({ locale = "en" }: SupportWidgetProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const t = getDictionary(locale).dashboard.shell.supportWidget;

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
    <div ref={rootRef} className="fixed bottom-6 left-6 z-40">
      {open && (
        <div className="absolute bottom-full left-0 mb-3 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
          <p className="text-sm font-semibold text-gray-900">{t.needHand}</p>
          <p className="mt-1.5 text-sm text-gray-600">{t.body}</p>
          <a
            href="mailto:support@invimbo.com"
            className="mt-3 inline-block text-sm font-semibold text-[var(--dash-accent-text)] underline underline-offset-2"
          >
            support@invimbo.com
          </a>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={open ? t.closeLabel : t.openLabel}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--dash-accent-text)] text-[var(--dash-accent-contrast)] shadow-lg transition hover:bg-[var(--dash-accent)]"
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <MessageCircle className="h-5 w-5" aria-hidden="true" />}
      </button>
    </div>
  );
}
