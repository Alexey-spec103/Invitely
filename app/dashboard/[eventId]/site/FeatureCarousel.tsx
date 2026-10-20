"use client";

import { useEffect, useState } from "react";
import { MousePointerClick, QrCode, PenTool, Send, Download, Globe, X, type LucideIcon } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

// Same "invitely:<kind>:<id>" storage-key convention as FirstVisitTour.
const STORAGE_KEY = "invitely:featureCarouselDismissed";

interface FeatureCarouselProps {
  /** Optional, defaulting to English -- see DashboardNav's matching prop
   * comment for why. */
  locale?: Locale;
}

interface FeatureCard {
  icon: LucideIcon;
  title: string;
  body: string;
  isNew?: boolean;
}

// Fixed icon/isNew pairing per card index -- `dashboard.site.featureCarousel.items`
// (lib/i18n/translations/*.ts) holds the translated title/body for each
// locale, in this same order; only "Send invites your way" (index 3) gets
// the NEW badge, matching the reasoning in the comment below.
const FEATURE_ICONS: { icon: LucideIcon; isNew?: boolean }[] = [
  { icon: MousePointerClick },
  { icon: QrCode },
  { icon: PenTool },
  { icon: Send, isNew: true },
  { icon: Download },
  { icon: Globe },
];

// dashboard-audit.md D2: weddingpost.ru's own "selling carousel" -- 6 cards
// with NEW badges, pitching real features. Verified against the actual
// codebase before writing this (not copied from their claims): no payment
// processing exists (Gift is a text/link wish-list), QR codes don't drive
// Find My Table, Canvas has no shape primitives, multi-channel sending opens
// the host's own WhatsApp/SMS/email rather than sending automatically, and
// downloads are watermark-gated only, never count-limited. Only "Send
// invites your way" gets the NEW badge -- it's the one card describing
// something actually shipped this pass (recordInvitationSent/SendInviteMenu);
// badging the rest would be dishonest the same way weddingpost's own
// permanent "NEW V10" badge is.

// UX audit (2026-10-12): this used to render unconditionally on every
// single visit, permanently sitting between the page's header and the
// live preview/canvas it's pitching -- a returning host had to scroll past
// it (and three other blocks) every time just to reach the thing it told
// them to click. Now it's dismissible and stays dismissed per browser,
// same mechanism as FirstVisitTour's own "seen it" flag. Rendered as null
// (not just visually hidden) once dismissed, so it doesn't still occupy
// layout space.
export default function FeatureCarousel({ locale = "en" }: FeatureCarouselProps) {
  const [dismissed, setDismissed] = useState(true);
  const t = getDictionary(locale).dashboard.site.featureCarousel;
  const FEATURES: FeatureCard[] = t.items.map((item, index) => ({
    ...item,
    icon: FEATURE_ICONS[index].icon,
    isNew: FEATURE_ICONS[index].isNew,
  }));

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // Private-browsing/storage-restricted contexts: show it, same as a
      // first-ever visit would.
      setDismissed(false);
    }
  }, []);

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Non-fatal -- worst case it reappears next visit.
    }
  };

  return (
    <div className="relative mt-6">
      <button
        type="button"
        onClick={dismiss}
        aria-label={t.dismiss}
        className="absolute -top-2 right-0 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text-muted)] transition hover:text-[var(--dash-text)]"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="relative flex w-60 shrink-0 snap-start flex-col gap-3 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4"
          >
            {feature.isNew && (
              <span className="absolute right-3 top-3 rounded-full bg-[var(--dash-accent)] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[var(--dash-accent-contrast)]">
                {t.newBadge}
              </span>
            )}
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--dash-accent)_16%,transparent)] text-[var(--dash-accent)]">
              <feature.icon className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <p className="text-sm font-semibold text-[var(--dash-text)]">{feature.title}</p>
            <p className="text-xs leading-relaxed text-[var(--dash-text-muted)]">{feature.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
