"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";

/** dashboard-audit.md D5: weddingpost.ru keeps a round chat widget pinned in
 * the corner of every dashboard screen, backed by a real live-chat vendor.
 * We have no live-chat infrastructure, so this is the honest equivalent
 * (same call as B19's SupportCard): a persistent round button that opens a
 * small panel pointing at the one real support channel the app already
 * surfaces everywhere else (Terms, Privacy, landing, SupportCard) --
 * support@invitely.app, read by a real person -- rather than faking a live
 * chat session that doesn't exist. Bottom-left (not bottom-right, where
 * FirstVisitTour already floats) so the two never overlap on a first visit. */
export default function SupportWidget() {
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
    <div ref={rootRef} className="fixed bottom-6 left-6 z-40">
      {open && (
        <div className="absolute bottom-full left-0 mb-3 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
          <p className="text-sm font-semibold text-gray-900">Need a hand?</p>
          <p className="mt-1.5 text-sm text-gray-600">
            We don&apos;t run a live chat yet — email us and a real person will get back to you.
          </p>
          <a
            href="mailto:support@invitely.app"
            className="mt-3 inline-block text-sm font-semibold text-[var(--dash-accent)] underline underline-offset-2"
          >
            support@invitely.app
          </a>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={open ? "Close support" : "Contact support"}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--dash-accent)] text-[var(--dash-accent-contrast)] shadow-lg transition hover:bg-[var(--dash-accent-hover)]"
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <MessageCircle className="h-5 w-5" aria-hidden="true" />}
      </button>
    </div>
  );
}
