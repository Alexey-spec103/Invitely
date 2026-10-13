"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, Check, ExternalLink, FileDown } from "lucide-react";

interface SendingGuideCardProps {
  eventId: string;
  slug: string;
  appDomain: string;
  hasPremiumAccess: boolean;
  rsvpEmailNotifications: boolean;
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
}: SendingGuideCardProps) {
  const [copied, setCopied] = useState(false);

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
      <p className="text-sm font-bold text-[var(--dash-text)]">🔗 Your invitation link</p>

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
                <Check className="h-[14px] w-[14px]" /> Copied!
              </>
            ) : (
              <>
                <Copy className="h-[14px] w-[14px]" /> Copy
              </>
            )}
          </button>
          <Link
            href={`/e/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-xs font-semibold text-[var(--dash-text)] transition hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
          >
            Open <ExternalLink className="h-[14px] w-[14px]" />
          </Link>
        </div>
      </div>

      <p className="mt-2 text-xs text-[var(--dash-text-muted)]">
        Send it however you like (text, email, WhatsApp) — guests open it, RSVP, and{" "}
        {rsvpEmailNotifications
          ? "a reply lands in your inbox the moment they answer (you can also check the Guests tab anytime)."
          : "you can check their answer anytime in the Guests tab (email alerts are off — turn them back on there)."}
      </p>

      {hasPremiumAccess && (
        <Link
          href={`/dashboard/${eventId}/paper`}
          className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--dash-accent)] hover:underline"
        >
          <FileDown className="h-[13px] w-[13px]" /> Download your watermark-free paper PDFs
        </Link>
      )}
    </div>
  );
}
