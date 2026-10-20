"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { togglePublish } from "./[eventId]/actions";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

interface PublishToggleProps {
  eventId: string;
  status: string;
  /** Optional, defaulting to English -- see DashboardNav's matching prop
   * comment for why. */
  locale?: Locale;
}

export default function PublishToggle({ eventId, status, locale = "en" }: PublishToggleProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = getDictionary(locale).dashboard.shell.publish;

  const isPublished = status === "published";

  const handleClick = async () => {
    setError(null);
    setIsPending(true);
    const result = await togglePublish(eventId);
    if (result.ok) {
      router.refresh();
    } else {
      setError(result.message);
    }
    setIsPending(false);
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        // Contrast audit (2026-10-14): white text directly on --dash-accent
        // measures 2.82:1, failing AA -- same bug fixed for
        // .dash-btn-primary/.landing-cta (see globals.css). Resting state
        // now uses --dash-accent-text (5.57:1), brightens to --dash-accent
        // on hover.
        className={
          isPublished
            ? "rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface-2)] px-4 py-2.5 text-sm font-bold text-[var(--dash-text)] transition hover:border-[var(--dash-accent)] disabled:cursor-not-allowed disabled:opacity-60"
            : "rounded-full bg-[var(--dash-accent-text)] px-4 py-2.5 text-sm font-bold text-[var(--dash-accent-contrast)] shadow-[0_6px_16px_rgba(255,107,69,0.35)] transition hover:bg-[var(--dash-accent)] disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {isPending ? t.saving : isPublished ? t.unpublish : t.publish}
      </button>
      <p className="mt-1 text-xs text-[var(--dash-text-muted)]">
        {isPublished ? t.visibleNote : t.hiddenNote}
      </p>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
