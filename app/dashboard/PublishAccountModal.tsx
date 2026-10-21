"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { upgradeAnonymousAccount } from "@/lib/authUpgrade";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";
import { usePrefersReducedMotion } from "@/components/usePrefersReducedMotion";

interface PublishAccountModalProps {
  open: boolean;
  onClose: () => void;
  /** Called once the session has a real (non-anonymous) account -- the
   * caller re-attempts the publish the host originally asked for, instead
   * of making them click "Publish" a second time. Not called if the project
   * requires email confirmation first (see `pendingConfirmation` below) --
   * there's no real account to publish with yet at that point. */
  onAccountReady: () => void;
  /** Optional, defaulting to English -- same convention as every other
   * dashboard component this session. */
  locale?: Locale;
}

/** Fires the moment an anonymous host clicks "Publish site" instead of the
 * silent `togglePublish` server-action error this used to surface as an
 * easy-to-miss red line of text next to the button, disconnected from the
 * actual "Create account" control sitting in a banner at the top of the
 * page (usability walkthrough 2026-10-21, critical finding #1). Reuses
 * `upgradeAnonymousAccount` -- the exact same account-upgrade path
 * `AnonymousAccountBanner` already uses -- just surfaced right where the
 * host hit the gate, with its own "why" explained and a button that visibly
 * does the thing they were already trying to do. Visual pattern copied from
 * `components/ui/PremiumUpgradeModal.tsx`, this codebase's one other
 * "explain the gate, offer the way through" modal. */
export default function PublishAccountModal({ open, onClose, onAccountReady, locale }: PublishAccountModalProps) {
  const reduceMotion = usePrefersReducedMotion();
  const dictionary = getDictionary(locale ?? "en").dashboard;
  const t = dictionary.shell;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await upgradeAnonymousAccount(email, password);
      if (result.pendingConfirmation) {
        setPendingConfirmation(true);
      } else {
        onAccountReady();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.anonBanner.genericError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      // motion-audit 2026-10-21: this was a plain conditional render with no
      // enter/exit at all -- the highest-stakes moment in the whole host
      // funnel (the publish gate) just snapping in/out read as a glitch, not
      // a considered product moment. Backdrop fade is the full `duration`;
      // the card gets Jakub's enter recipe (opacity + y + a touch of scale,
      // `bounce: 0` so it settles rather than overshoots) without blur --
      // blur on a text-bearing card delays legibility, exactly the trade
      // this skill's own anti-checklist warns against.
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
    >
      <motion.div
        className="w-full max-w-sm rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 6, scale: 0.98 }}
        transition={reduceMotion ? { duration: 0 } : { type: "spring", duration: 0.4, bounce: 0 }}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">
              🔒
            </span>
            <h2 className="dash-h2 text-base text-[var(--dash-accent)]">{t.publish.accountModalTitle}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
            title={dictionary.common.upgradeModal.close}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {pendingConfirmation ? (
          <p className="text-sm text-[var(--dash-text)]">{t.publish.confirmEmailToPublish}</p>
        ) : (
          <>
            <p className="text-sm text-[var(--dash-text-muted)]">{t.publish.accountModalBody}</p>
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t.anonBanner.emailPlaceholder}
                required
                autoComplete="email"
                className="dash-input"
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t.anonBanner.passwordPlaceholder}
                required
                minLength={6}
                autoComplete="new-password"
                className="dash-input"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="dash-btn dash-btn-primary mt-2 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? t.anonBanner.creating : t.anonBanner.createAccount}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
