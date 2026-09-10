import { MousePointerClick, QrCode, PenTool, Send, Download, Globe, type LucideIcon } from "lucide-react";

interface FeatureCard {
  icon: LucideIcon;
  title: string;
  body: string;
  isNew?: boolean;
}

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
const FEATURES: FeatureCard[] = [
  {
    icon: MousePointerClick,
    title: "Edit your site by clicking on it",
    body: "No separate editor-vs-preview split — click any text on the live page, type, and it autosaves.",
  },
  {
    icon: QrCode,
    title: "A QR code on every invitation",
    body: "Each guest's printed invite carries a unique code straight to their personal RSVP page.",
  },
  {
    icon: PenTool,
    title: "A blank canvas, when you want one",
    body: "Drop in text, photos, video and QR codes anywhere — a second, freeform way to design, alongside the guided one.",
  },
  {
    icon: Send,
    title: "Send invites your way",
    body: "WhatsApp, SMS, email or a plain link — one click opens it pre-filled, and we keep track of who's been sent what.",
    isNew: true,
  },
  {
    icon: Download,
    title: "Nothing's ever locked while you decide",
    body: "Every PDF downloads on every plan — Premium only removes the watermark, it doesn't unlock a download you couldn't get before.",
  },
  {
    icon: Globe,
    title: "Bring your own domain",
    body: "Point yourwedding.com at your site — we verify it's really yours, no hosting lock-in.",
  },
];

export default function FeatureCarousel() {
  return (
    <div className="mt-6 -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      {FEATURES.map((feature) => (
        <div
          key={feature.title}
          className="relative flex w-60 shrink-0 snap-start flex-col gap-3 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4"
        >
          {feature.isNew && (
            <span className="absolute right-3 top-3 rounded-full bg-[var(--dash-accent)] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[var(--dash-accent-contrast)]">
              NEW
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
  );
}
