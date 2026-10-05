"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

interface FunnelNavProps {
  eventId: string;
}

type StepId = "style" | "site" | "paper" | "guests";

/** dashboard-audit.md B3: weddingpost.ru's cabinet has a persistent
 * back/forward bar at the bottom of every constructor/hub screen, wired to
 * the funnel order (Style -> Site -> Paper -> Guests), not just "previous/
 * next rail item" -- confirmed both Site's and Paper's own back-links point
 * to Style specifically, not to each other.
 *
 * Direct feedback: Guests/Banquet/Invitations used to be three separate
 * funnel steps for one connected task -- Banquet's assignment UI moved onto
 * Guests directly and Invitations' downloads moved onto Paper, so the chain
 * is four steps now, not six.
 *
 * Mounted once in DashboardShell (below `children`) rather than per-page, so
 * it can't drift out of sync with the rail; renders nothing on Style itself
 * (the funnel's entry point, per the audit has no bar) or on routes outside
 * the funnel entirely (Account, Plan, Canvas). */
// impeccable critique P1 follow-up: the host's actual ask wasn't "stop
// reminding me to pay" (the header pill + Site's sticky footer CTA were
// both deliberate reachability choices, kept as-is) but "make it obvious
// where I am and what's next" -- a plain back/forward link pair doesn't
// show that on its own. Labels match stepHrefs below.
const STEP_LABELS: Record<StepId, string> = {
  style: "Style",
  site: "Site",
  paper: "Paper",
  guests: "Guests",
};

export default function FunnelNav({ eventId }: FunnelNavProps) {
  const pathname = usePathname();
  const base = `/dashboard/${eventId}`;

  const stepHrefs: { id: StepId; href: string }[] = [
    { id: "style", href: `${base}/style` },
    { id: "site", href: `${base}/site` },
    { id: "paper", href: `${base}/paper` },
    { id: "guests", href: `${base}/guests` },
  ];

  const current = stepHrefs.find((step) => pathname.startsWith(step.href));
  if (!current || current.id === "style") return null;

  const currentIndex = stepHrefs.findIndex((step) => step.id === current.id);

  const links: Record<
    Exclude<StepId, "style">,
    { back: { href: string; label: string }; forward?: { href: string; label: string } }
  > = {
    site: { back: { href: `${base}/style`, label: "Back to Style" }, forward: { href: `${base}/paper`, label: "Paper" } },
    paper: { back: { href: `${base}/style`, label: "Back to Style" }, forward: { href: `${base}/guests`, label: "Guests" } },
    // Direct feedback: Guests is the last funnel step now, and it used to
    // just stop -- nothing told a host who just finished adding/seating
    // guests that there was anywhere left to go. /plan is where "get your
    // link" actually happens (publish works on any plan already; this is
    // where a host decides whether to stay free-with-watermark or pay to
    // remove it) -- the one genuinely new destination to close the loop on.
    guests: { back: { href: `${base}/paper`, label: "Paper" }, forward: { href: `${base}/plan`, label: "Get your link" } },
  };

  const { back, forward } = links[current.id];

  return (
    <div className="mt-10 border-t border-[var(--dash-border)] pt-4">
      <div className="mb-3 flex items-center" aria-label={`Step ${currentIndex + 1} of ${stepHrefs.length}: ${STEP_LABELS[current.id]}`}>
        {stepHrefs.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <div key={step.id} className="flex items-center">
              {/* Direct feedback: the step row looked like a progress
                  display, not a way to get anywhere -- every step now
                  jumps straight to that tab, same as clicking it in the
                  rail on the left, just framed as "skip ahead/back" instead
                  of only "one step at a time" like the back/forward links
                  below it. */}
              <Link
                href={step.href}
                aria-current={isCurrent ? "step" : undefined}
                className="group flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 -ml-1 transition hover:bg-[var(--dash-surface-2)]"
              >
                <span
                  className={
                    isCurrent
                      ? "flex h-5 w-5 items-center justify-center rounded-full bg-[var(--dash-accent)] text-[10px] font-bold text-[var(--dash-accent-contrast)]"
                      : isDone
                        ? "flex h-5 w-5 items-center justify-center rounded-full bg-[var(--dash-accent)]/20 text-[var(--dash-accent)]"
                        : "flex h-5 w-5 items-center justify-center rounded-full border border-[var(--dash-border)] text-[10px] text-[var(--dash-text-muted)] group-hover:border-[var(--dash-accent)] group-hover:text-[var(--dash-accent)]"
                  }
                >
                  {isDone ? <Check className="h-3 w-3" aria-hidden="true" /> : index + 1}
                </span>
                <span
                  className={`text-xs font-medium ${
                    isCurrent ? "text-[var(--dash-text)]" : "text-[var(--dash-text-muted)] group-hover:text-[var(--dash-text)]"
                  }`}
                >
                  {STEP_LABELS[step.id]}
                </span>
              </Link>
              {index < stepHrefs.length - 1 && (
                <span className="mx-1 h-px w-4 shrink-0 bg-[var(--dash-border)]" aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between">
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
    </div>
  );
}
