"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getEventType } from "@/lib/eventTypes";

interface FunnelNavProps {
  eventId: string;
  eventType: string;
}

type StepId = "style" | "site" | "paper" | "guests" | "invitations" | "banquet";

/** dashboard-audit.md B3: weddingpost.ru's cabinet has a persistent
 * back/forward bar at the bottom of every constructor/hub screen, wired to
 * the funnel order (Style -> Site -> Paper -> Guests -> Invitations ->
 * Banquet), not just "previous/next rail item" -- confirmed both Site's and
 * Paper's own back-links point to Style specifically, not to each other.
 * Mounted once in DashboardShell (below `children`) rather than per-page, so
 * it can't drift out of sync with the rail; renders nothing on Style itself
 * (the funnel's entry point, per the audit has no bar) or on routes outside
 * the funnel entirely (Account, Plan, Canvas). */
export default function FunnelNav({ eventId, eventType }: FunnelNavProps) {
  const pathname = usePathname();
  const base = `/dashboard/${eventId}`;
  const banquetLabel = getEventType(eventType).seatingLabel;

  const stepHrefs: { id: StepId; href: string }[] = [
    { id: "style", href: `${base}/style` },
    { id: "site", href: `${base}/site` },
    { id: "paper", href: `${base}/paper` },
    { id: "guests", href: `${base}/guests` },
    { id: "invitations", href: `${base}/invitations` },
    { id: "banquet", href: `${base}/banquet` },
  ];

  const current = stepHrefs.find((step) => pathname.startsWith(step.href));
  if (!current || current.id === "style") return null;

  const links: Record<
    Exclude<StepId, "style">,
    { back: { href: string; label: string }; forward?: { href: string; label: string } }
  > = {
    site: { back: { href: `${base}/style`, label: "Back to Style" }, forward: { href: `${base}/paper`, label: "Paper" } },
    paper: { back: { href: `${base}/style`, label: "Back to Style" }, forward: { href: `${base}/guests`, label: "Guests" } },
    guests: {
      back: { href: `${base}/paper`, label: "Paper" },
      forward: { href: `${base}/invitations`, label: "Get your invitations" },
    },
    invitations: { back: { href: `${base}/guests`, label: "Guests" }, forward: { href: `${base}/banquet`, label: banquetLabel } },
    banquet: { back: { href: `${base}/invitations`, label: "Invitations" } },
  };

  const { back, forward } = links[current.id];

  return (
    <div className="mt-10 flex items-center justify-between border-t border-[var(--dash-border)] pt-4">
      <Link
        href={back.href}
        className="flex items-center gap-1 text-sm font-medium text-[var(--dash-text-muted)] transition hover:text-[var(--dash-accent)]"
      >
        <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
        {back.label}
      </Link>
      {forward ? (
        <Link
          href={forward.href}
          className="flex items-center gap-1 text-sm font-semibold text-[var(--dash-accent)] transition hover:text-[var(--dash-accent-hover)]"
        >
          {forward.label}
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
