import Link from "next/link";
import { FileDown } from "lucide-react";

interface SendingGuideCardProps {
  eventId: string;
  hasPremiumAccess: boolean;
  rsvpEmailNotifications: boolean;
}

/** post-payment-guidance audit (2026-10-12): PaymentSuccessCard explains
 * "copy your link -> guests RSVP -> replies land in your inbox / Guests
 * tab" well, but only on the one visit right after checkout (gated on the
 * `checkout=success` query param -- see page.tsx). Navigate away, refresh,
 * or come back next month, and that explanation is gone for good -- the
 * underlying features (header's "Copy your link" button, the Guests tab)
 * stay reachable, but a host who forgot how sending works has nothing to
 * re-find it with. This is the permanent, compact equivalent: shown on
 * every visit once a host is on a paid plan, not just the first. */
export default function SendingGuideCard({ eventId, hasPremiumAccess, rsvpEmailNotifications }: SendingGuideCardProps) {
  return (
    <div className="mt-4 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3 text-xs text-[var(--dash-text-muted)]">
      <p>
        <span className="font-semibold text-[var(--dash-text)]">How sending works:</span> copy your link with the
        button above and send it however you like (text, email, WhatsApp) — guests open it, RSVP, and{" "}
        {rsvpEmailNotifications
          ? "a reply lands in your inbox the moment they answer (you can also check the Guests tab anytime)."
          : "you can check their answer anytime in the Guests tab (email alerts are off — turn them back on there)."}
      </p>
      {hasPremiumAccess && (
        <Link
          href={`/dashboard/${eventId}/paper`}
          className="mt-1.5 inline-flex items-center gap-1.5 font-semibold text-[var(--dash-accent)] hover:underline"
        >
          <FileDown className="h-[13px] w-[13px]" /> Download your watermark-free paper PDFs
        </Link>
      )}
    </div>
  );
}
