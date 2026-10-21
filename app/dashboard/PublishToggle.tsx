"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { togglePublish } from "./[eventId]/actions";
import PublishAccountModal from "./PublishAccountModal";
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
  const [showAccountModal, setShowAccountModal] = useState(false);
  const t = getDictionary(locale).dashboard.shell.publish;

  const isPublished = status === "published";

  const attemptPublish = async () => {
    setError(null);
    setIsPending(true);
    const result = await togglePublish(eventId);
    if (result.ok) {
      router.refresh();
    } else if (result.reason === "anonymous") {
      // Usability walkthrough 2026-10-21, critical finding #1: this used to
      // just set `error` to the raw "Create a free account to continue"
      // string and leave it at that -- an unclickable line of red text next
      // to the button, with the real "Create account" control sitting in a
      // banner the host had to go find at the top of the page. Now the
      // click itself opens the thing that actually gets them unblocked.
      setShowAccountModal(true);
    } else {
      setError(result.message);
    }
    setIsPending(false);
  };

  const handleClick = () => {
    void attemptPublish();
  };

  // Called once `PublishAccountModal` confirms the session now has a real
  // account -- re-run the exact publish the host originally clicked for,
  // instead of closing the modal and leaving them to find the Publish
  // button and click it again.
  const handleAccountReady = () => {
    setShowAccountModal(false);
    void attemptPublish();
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
      {showAccountModal && (
        // Mounted only while open, not always-rendered-with-open=false --
        // a fresh mount each time means a fresh form/error/pending state
        // automatically, no reset-on-reopen effect needed (and avoids
        // react-hooks/set-state-in-effect, which that pattern trips).
        <PublishAccountModal
          open={showAccountModal}
          onClose={() => setShowAccountModal(false)}
          onAccountReady={handleAccountReady}
          locale={locale}
        />
      )}
    </div>
  );
}
