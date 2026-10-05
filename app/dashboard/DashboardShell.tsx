"use client";

import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Copy, Check } from "lucide-react";
import DashboardNav from "./DashboardNav";
import PublishToggle from "./PublishToggle";
import EventSwitcher from "./EventSwitcher";
import UserMenu from "./UserMenu";
import PlanBadge from "./PlanBadge";
import FunnelNav from "./FunnelNav";
import SupportWidget from "./SupportWidget";
import AnonymousAccountBanner from "./AnonymousAccountBanner";
import InvitelyLogo from "@/components/InvitelyLogo";
import { isConstructorRoute } from "@/lib/dashboardChrome";

// Every header child (EventSwitcher, UserMenu, PublishToggle, the icon links
// right here) already reads its colors from these --dash-* custom properties
// -- overriding them just on <header> re-themes the whole thing to light
// without touching any of those components individually.
const LIGHT_HEADER_VARS = {
  "--dash-surface": "#ffffff",
  "--dash-surface-2": "#f3f4f6",
  "--dash-border": "#e5e7eb",
  "--dash-text": "#111827",
  "--dash-text-muted": "#6b7280",
} as CSSProperties;

interface DashboardShellEvent {
  id: string;
  title: string;
  event_type: string;
  status: string | null;
}

interface DashboardShellProps {
  userEmail: string;
  /** True for a visitor still on their anonymous-trial session (see
   * lib/supabase/proxy.ts's onboarding bootstrap) -- drives
   * AnonymousAccountBanner and UserMenu's email fallback. */
  isAnonymous: boolean;
  events: DashboardShellEvent[];
  /** Which event's id the nav links and the switcher's selected option are
   * built from. On an `[eventId]` route this is that event; on a route with
   * no event of its own (Account) it's just the user's first event, so the
   * rail/switcher still have somewhere to point -- matches weddingpost.ru,
   * whose own rail stays visible (with nothing highlighted) on its Account
   * screen rather than disappearing. */
  navEventId: string;
  /** Only passed on an actual `[eventId]` route -- the public-site-link icon
   * and Publish button are event-specific actions. weddingpost.ru's own
   * Account screen shows neither (confirmed via Chrome: just logo + avatar
   * in its header there), so omitting this prop hides both rather than
   * guessing at a "current" event's publish state to show. */
  publish?: {
    eventId: string;
    status: string | null;
    slug: string;
    planId: string;
    /** A verified custom/invimbo.com subdomain, if the host has one -- the
     * link worth copying is the one a guest will actually land on, not the
     * default /e/{slug} path underneath it. Null on Free/Basic hosts with no
     * domain claimed (or one still pending verification), same gate
     * `resolveCustomDomain` itself uses before routing a request there. */
    customDomain?: string | null;
  };
  children: ReactNode;
}

/** The main thing a host needs out of this whole product, repeatedly flagged
 * as getting buried under plan-upsell messaging ("Get your link -- €19"
 * reads as "pay to get ANY link," when Free publishing has never actually
 * been gated on payment -- see PlanSelectForm.tsx/PublishToggle.tsx). This
 * is the one always-visible, plan-independent "here's your real link, copy
 * it" control, reachable from every dashboard page since DashboardShell
 * wraps all of them. Clipboard write only (no share-sheet/QR here) -- the
 * Guests tab already owns per-guest personalized links and multi-channel
 * sending (SendInviteMenu); this is just the host's own one link. */
function CopyLinkButton({ slug, customDomain }: { slug: string; customDomain?: string | null }) {
  const [copied, setCopied] = useState(false);

  // Built at click time, never at render time -- `window.location.origin`
  // doesn't exist during the server render, so computing the full URL in the
  // JSX below (even just for a `title` attribute) made the server-rendered
  // and hydrated markup disagree and threw a hydration-mismatch warning,
  // confirmed live via the dev overlay. This runs client-only, on a real
  // user gesture, so there's no SSR/hydration pass to mismatch against.
  const handleCopy = async () => {
    const href = customDomain ? `https://${customDomain}` : `${window.location.origin}/e/${slug}`;
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission denied or unavailable -- the host can still
      // get the URL from "See what guests see" (opens it directly) or the
      // Site tab's own custom-domain card, so this never fully blocks them.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={customDomain ? `https://${customDomain}` : `/e/${slug}`}
      className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-xs font-semibold text-[var(--dash-text)] transition hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
    >
      {copied ? (
        <>
          <Check className="h-[16px] w-[16px] shrink-0 text-emerald-600" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-[16px] w-[16px] shrink-0" />
          <span className="hidden sm:inline">Copy your link</span>
          <span className="sm:hidden">Copy link</span>
        </>
      )}
    </button>
  );
}

export default function DashboardShell({
  userEmail,
  isAnonymous,
  events,
  navEventId,
  publish,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const isConstructor = isConstructorRoute(pathname, navEventId);

  return (
    <div className="dashboard-shell min-h-screen bg-[var(--dash-light-bg)] text-neutral-900">
      {/* Direct feedback: "Get your link" (PlanBadge, on Free) needs to stay
          reachable the whole time a host is scrolled deep into a long
          constructor page, not just at the very top -- sticky, not just
          in-flow. z-40 keeps it above ordinary page content (Editable
          blocks list, section cards) but still under PlanBadge's own
          dropdown (rendered as its child, so DOM order already stacks it
          above the header regardless of z-index). */}
      <header
        style={isConstructor ? undefined : LIGHT_HEADER_VARS}
        // impeccable critique P2: the hub/constructor chrome flip (light <->
        // near-black) used to snap instantly on every rail click, reading as
        // a layout flash rather than a deliberate mode switch -- `--dash-*`
        // custom properties aren't natively interpolable, but the literal
        // color properties that consume them (background-color, color,
        // border-color) still cross-fade correctly once they themselves
        // transition, since the browser re-resolves and animates toward
        // their final computed value each time the variable changes.
        className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-y-2 border-b border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 py-4 transition-colors duration-300 sm:px-6"
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-base font-semibold tracking-tight text-[var(--dash-text)]"
          >
            <InvitelyLogo />
            Invimbo
          </Link>
          <span className="hidden h-4 w-px bg-[var(--dash-border)] sm:block" />
          <EventSwitcher events={events} currentEventId={navEventId} />
        </div>
        <div className="flex items-center gap-2">
          {publish && <CopyLinkButton slug={publish.slug} customDomain={publish.customDomain} />}
          {publish && (
            // Competitor research (Greenvelope's "send a self-test" step):
            // this was icon-only with just a hover title -- easy to miss,
            // and invisible on touch. A short, always-visible label turns
            // "what does this external-link icon even do" into a stated,
            // guest-framed purpose, without needing to hover to find out.
            <Link
              href={`/e/${publish.slug}`}
              target="_blank"
              rel="noreferrer"
              title={`See what your guests see (/e/${publish.slug})`}
              className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--dash-border)] px-3 text-xs font-medium text-[var(--dash-text-muted)] transition hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
            >
              <ExternalLink className="h-[16px] w-[16px] shrink-0" />
              <span className="hidden sm:inline">See what guests see</span>
            </Link>
          )}
          {publish && <PlanBadge planId={publish.planId} eventId={publish.eventId} />}
          <UserMenu userEmail={userEmail} planEventId={navEventId} />
          {publish && <PublishToggle eventId={publish.eventId} status={publish.status ?? "draft"} />}
        </div>
      </header>

      <AnonymousAccountBanner isAnonymous={isAnonymous} />

      <div className="flex flex-col sm:flex-row">
        <DashboardNav eventId={navEventId} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-10 sm:py-10">
          {children}
          <FunnelNav eventId={navEventId} />
        </main>
      </div>

      <SupportWidget />
    </div>
  );
}
