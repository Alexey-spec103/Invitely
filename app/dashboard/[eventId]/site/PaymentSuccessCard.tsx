"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, Check, ExternalLink, FileDown } from "lucide-react";

interface PaymentSuccessCardProps {
  eventId: string;
  slug: string;
  appDomain: string;
  hasPremiumAccess: boolean;
  rsvpEmailNotifications: boolean;
}

/** Direct feedback: the previous success state ("Payment received" + an
 * "Open your link ->" button) made a host click through to a new tab just
 * to see or copy the thing they just paid for. The link itself -- the one
 * thing a host needs to actually start sending invitations -- was never
 * shown as text at all. This shows it, large and copyable, right here.
 *
 * Built-at-click-time href, same reasoning as DashboardShell's own
 * CopyLinkButton: `window.location.origin` doesn't exist during the server
 * render, so computing it in JSX (even just to display) made the
 * server-rendered and hydrated markup disagree. The *displayed* text uses
 * `appDomain` (a plain env-derived string, identical on server and client,
 * same fallback DomainEditForm already uses two cards down) so what's shown
 * always reads as a real link even though the actual copied value is built
 * fresh client-side for correctness in every environment. */
export default function PaymentSuccessCard({
  eventId,
  slug,
  appDomain,
  hasPremiumAccess,
  rsvpEmailNotifications,
}: PaymentSuccessCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const href = `${window.location.origin}/e/${slug}`;
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission denied or unavailable -- "Open ->" still works.
    }
  };

  return (
    <div className="mt-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5">
      <p className="text-base font-bold text-emerald-900">🎉 Payment received — your link is ready to send.</p>

      <div className="mt-3 flex flex-col gap-2 rounded-xl border border-emerald-200 bg-white p-3 sm:flex-row sm:items-center">
        <span className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm font-semibold text-emerald-900 sm:text-base">
          {appDomain}/e/{slug}
        </span>
        <div className="flex flex-none gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex h-9 items-center gap-1.5 rounded-full bg-emerald-700 px-3 text-xs font-semibold text-white transition hover:bg-emerald-800"
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
            className="flex h-9 items-center gap-1.5 rounded-full border border-emerald-300 bg-white px-3 text-xs font-semibold text-emerald-900 transition hover:border-emerald-500"
          >
            Open <ExternalLink className="h-[14px] w-[14px]" />
          </Link>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        {hasPremiumAccess && (
          <Link
            href={`/dashboard/${eventId}/paper`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-900"
          >
            <FileDown className="h-[15px] w-[15px]" /> Download your paper PDFs — watermark-free now
          </Link>
        )}
        <a href="#custom-domain-card" className="text-sm font-semibold text-emerald-800 underline">
          Or claim a nicer address (yourname.{appDomain})
        </a>
      </div>

      <p className="mt-3 text-xs text-emerald-700">
        {rsvpEmailNotifications
          ? "Every RSVP reply lands in your inbox the moment a guest responds — you can also check them anytime in the Guests tab."
          : "Email alerts for new RSVPs are off — check every response anytime in the Guests tab, or turn alerts back on there."}
      </p>
    </div>
  );
}
