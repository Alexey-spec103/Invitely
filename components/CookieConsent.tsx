"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

const CONSENT_KEY = "invimbo_cookie_consent";
type Consent = "accepted" | "declined";

function readStoredConsent(): Consent | null {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    return stored === "accepted" || stored === "declined" ? stored : null;
  } catch {
    // Private browsing / storage blocked -- treat as "no decision yet",
    // same as a first-time visitor. The banner just reappears every visit
    // in that case, which is the honest behavior when nothing can persist.
    return null;
  }
}

/** Pre-launch legal pass (2026-10-27): Microsoft Clarity (session recording
 * + its own cookies) used to load unconditionally for every visitor --
 * directly contradicting this app's own Privacy Policy, which claims "We
 * don't use third-party advertising or tracking cookies." Gates Clarity
 * behind an explicit choice instead. Vercel Analytics is NOT gated here --
 * it's genuinely cookieless (Vercel's own documentation), so it was never
 * the thing needing consent; stays mounted unconditionally in layout.tsx. */
export default function CookieConsent({
  locale,
  clarityProjectId,
}: {
  locale: Locale;
  clarityProjectId?: string;
}) {
  const t = getDictionary(locale).cookieConsent;
  const [consent, setConsent] = useState<Consent | null>(null);
  const [mounted, setMounted] = useState(false);

  // Reads localStorage only after mount -- the server render has no way to
  // know a prior visitor's choice, so starting from "unknown" on both sides
  // avoids a hydration mismatch (same reasoning as every other client-only-
  // state component in this codebase, e.g. AnonymousAccountBanner's own
  // sessionStorage read).
  useEffect(() => {
    setMounted(true);
    setConsent(readStoredConsent());
  }, []);

  const decide = (value: Consent) => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // Decision still takes effect for this page view even if it can't
      // persist -- just means the banner reappears next visit.
    }
    setConsent(value);
  };

  return (
    <>
      {mounted && consent === "accepted" && clarityProjectId && process.env.NODE_ENV === "production" && (
        <Script id="clarity-analytics" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${clarityProjectId}");`}
        </Script>
      )}
      {mounted && consent === null && (
        <div
          role="dialog"
          aria-label={t.message}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white px-4 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:px-6"
        >
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              {t.message}{" "}
              <Link href="/privacy" className="font-medium text-gray-900 underline underline-offset-2">
                {t.privacyLinkText}
              </Link>
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => decide("declined")}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                {t.declineButton}
              </button>
              <button
                type="button"
                onClick={() => decide("accepted")}
                className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                {t.acceptButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
