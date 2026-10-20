"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Copy, Check, ExternalLink, FileDown, Download } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

interface SendingGuideCardProps {
  eventId: string;
  slug: string;
  appDomain: string;
  hasPremiumAccess: boolean;
  rsvpEmailNotifications: boolean;
  /** Optional, defaulting to English -- see DashboardNav's matching prop
   * comment for why. */
  locale?: Locale;
}

/** post-payment-guidance audit (2026-10-12) + direct feedback (2026-10-13):
 * PaymentSuccessCard's big copyable link box only ever shows once, on the
 * `checkout=success` redirect -- navigate away, refresh, or come back next
 * month, and it's gone for good. The header's own CopyLinkButton is
 * always there, but it's a silent click-to-copy button with no visible
 * link text -- a host can't actually SEE the thing they're about to send,
 * only trust that clicking copied something. This is the permanent,
 * always-visible equivalent of PaymentSuccessCard's box: shown on every
 * visit, on every plan (a Free host's link is real too, just badged), so
 * "where's my link" always has the same obvious answer on this page. */
export default function SendingGuideCard({
  eventId,
  slug,
  appDomain,
  hasPremiumAccess,
  rsvpEmailNotifications,
  locale = "en",
}: SendingGuideCardProps) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const t = getDictionary(locale).dashboard.site.sendingGuide;

  // 2026-10-16: a host had a QR code for every individual paper invitation
  // (PaperConstructor's per-guest codes) and for the guest photo-upload link
  // (GuestPhotoGallery), but nothing for the one link that matters most --
  // their own site. No way to print it on a welcome sign, a table card, or
  // a thank-you note without screenshotting a phone-generated QR from a
  // third-party site. Same dynamic-import-of-`qrcode` + client-side-only
  // generation pattern as GuestPhotoGallery.tsx (window.location.origin
  // doesn't exist during SSR). Generated at 1024px -- GuestPhotoGallery's
  // own 240px is fine for its fixed 96px on-screen size, but this PNG is
  // meant to be downloaded and printed at sizes a 240px source would turn
  // visibly blurry at; downscaling a larger raster for the on-screen
  // thumbnail costs nothing, upscaling a smaller one for print would.
  useEffect(() => {
    const inviteUrl = `${window.location.origin}/e/${slug}`;
    import("qrcode").then((QRCode) => {
      QRCode.default.toDataURL(inviteUrl, { margin: 1, width: 1024 }).then(setQrDataUrl);
    });
  }, [slug]);

  const handleCopy = async () => {
    const href = `${window.location.origin}/e/${slug}`;
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission denied or unavailable -- "Open" still works.
    }
  };

  return (
    <div className="mt-4 rounded-2xl border-2 border-[var(--dash-accent)] bg-[color-mix(in_srgb,var(--dash-accent)_10%,var(--dash-surface))] p-4">
      <p className="text-sm font-bold text-[var(--dash-text)]">{t.title}</p>

      <div className="mt-2 flex flex-col gap-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3 sm:flex-row sm:items-center">
        <span className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm font-semibold text-[var(--dash-text)] sm:text-base">
          {appDomain}/e/{slug}
        </span>
        <div className="flex flex-none gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex h-9 items-center gap-1.5 rounded-full bg-[var(--dash-accent)] px-3 text-xs font-bold text-[var(--dash-accent-contrast)] transition hover:bg-[var(--dash-accent-hover)]"
          >
            {copied ? (
              <>
                <Check className="h-[14px] w-[14px]" /> {t.copied}
              </>
            ) : (
              <>
                <Copy className="h-[14px] w-[14px]" /> {t.copy}
              </>
            )}
          </button>
          <Link
            href={`/e/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-xs font-semibold text-[var(--dash-text)] transition hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
          >
            {t.open} <ExternalLink className="h-[14px] w-[14px]" />
          </Link>
        </div>
      </div>

      <p className="mt-2 text-xs text-[var(--dash-text-muted)]">
        {rsvpEmailNotifications ? t.helperWithEmail : t.helperWithoutEmail}
      </p>

      <div className="mt-3 flex items-center gap-3 border-t border-[var(--dash-border)] pt-3">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt={`QR code linking to your invitation at ${appDomain}/e/${slug}`}
            className="h-16 w-16 flex-none rounded-md border border-[var(--dash-border)] bg-white p-1"
          />
        ) : (
          <div className="h-16 w-16 flex-none animate-pulse rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface)]" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[var(--dash-text)]">{t.qrTitle}</p>
          <p className="text-[11px] text-[var(--dash-text-muted)]">{t.qrCaption}</p>
        </div>
        <a
          href={qrDataUrl ?? undefined}
          download={`${slug}-qr-code.png`}
          aria-disabled={!qrDataUrl}
          className={`flex h-8 flex-none items-center gap-1.5 rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-xs font-semibold text-[var(--dash-text)] transition hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)] ${
            qrDataUrl ? "" : "pointer-events-none opacity-50"
          }`}
        >
          <Download className="h-[13px] w-[13px]" /> {t.download}
        </a>
      </div>

      {hasPremiumAccess && (
        <Link
          href={`/dashboard/${eventId}/paper`}
          className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--dash-accent)] hover:underline"
        >
          <FileDown className="h-[13px] w-[13px]" /> {t.downloadPapers}
        </Link>
      )}
    </div>
  );
}
