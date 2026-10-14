"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upgradeAnonymousAccount } from "@/lib/authUpgrade";

const DISMISS_KEY = "invitely:anon-banner-dismissed";

interface AnonymousAccountBannerProps {
  isAnonymous: boolean;
}

/** Shown across every dashboard page for a visitor who came in through the
 * anonymous-trial onboarding flow and hasn't created a real account yet --
 * non-blocking (dismissible, keeps working either way), and "creating an
 * account" upgrades the same session in place rather than starting over
 * (see lib/authUpgrade.ts). */
export default function AnonymousAccountBanner({ isAnonymous }: AnonymousAccountBannerProps) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);

  if (!isAnonymous || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // not fatal
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await upgradeAnonymousAccount(email, password);
      if (result.pendingConfirmation) {
        setPendingConfirmation(true);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Contrast audit (2026-10-14): this banner always sits directly on
  // .dashboard-shell's own light root background (bg-[var(--dash-light-bg)])
  // -- confirmed live, including on the dark constructor pages (Site/Paper/
  // Canvas), since those pages only darken their own <main> content, not
  // the shell chrome around it. But the text was using --dash-text/
  // --dash-text-muted, tokens meant for THAT dark <main> surface
  // (globals.css: "light pages need gray-900"), which made the message
  // 2.55:1 and "Not now" measured 1.02:1 -- essentially invisible, not just
  // low-contrast. Swapped to the plain gray-900/gray-500 pair already used
  // for light-surface text elsewhere in the cabinet. The buttons'
  // white-on-accent fix (bg-[var(--dash-accent-text)]) is the same one
  // already applied to .dash-btn-primary in globals.css.
  if (pendingConfirmation) {
    return (
      <div className="border-b border-[var(--dash-border)] bg-[var(--dash-accent)]/10 px-4 py-3 text-sm text-gray-900 sm:px-6">
        📬 Check your email to confirm - everything you&apos;ve made is already saved, keep working while you wait.
      </div>
    );
  }

  return (
    <div className="border-b border-[var(--dash-border)] bg-[var(--dash-accent)]/10 px-4 py-3 sm:px-6">
      {!showForm ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-gray-900">
            💾 Save your progress - create a free account
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="rounded-full bg-[var(--dash-accent-text)] px-4 py-1.5 text-sm font-semibold text-[var(--dash-accent-contrast)] transition hover:bg-[var(--dash-accent)]"
            >
              Create account
            </button>
            <button type="button" onClick={handleDismiss} className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Not now
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-start gap-2">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            required
            autoComplete="email"
            className="dash-input min-w-0 flex-1 basis-48"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password (min 6 characters)"
            required
            minLength={6}
            autoComplete="new-password"
            className="dash-input min-w-0 flex-1 basis-48"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-[var(--dash-accent-text)] px-4 py-1.5 text-sm font-semibold text-[var(--dash-accent-contrast)] transition hover:bg-[var(--dash-accent)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating…" : "Create account"}
          </button>
          <button type="button" onClick={() => setShowForm(false)} className="text-sm font-medium text-gray-500 hover:text-gray-900">
            Cancel
          </button>
          {error && <p className="w-full text-sm text-red-500">{error}</p>}
        </form>
      )}
    </div>
  );
}
