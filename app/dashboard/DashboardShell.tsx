"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";
import DashboardNav from "./DashboardNav";
import PublishToggle from "./PublishToggle";
import EventSwitcher from "./EventSwitcher";
import UserMenu from "./UserMenu";
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
  /** Which event's id/type the nav links and the switcher's selected option
   * are built from. On an `[eventId]` route this is that event; on a route
   * with no event of its own (Account) it's just the user's first event, so
   * the rail/switcher still have somewhere to point -- matches weddingpost.ru,
   * whose own rail stays visible (with nothing highlighted) on its Account
   * screen rather than disappearing. */
  navEventId: string;
  navEventType: string;
  /** Only passed on an actual `[eventId]` route -- the public-site-link icon
   * and Publish button are event-specific actions. weddingpost.ru's own
   * Account screen shows neither (confirmed via Chrome: just logo + avatar
   * in its header there), so omitting this prop hides both rather than
   * guessing at a "current" event's publish state to show. */
  publish?: {
    eventId: string;
    status: string | null;
    slug: string;
  };
  children: ReactNode;
}

export default function DashboardShell({
  userEmail,
  isAnonymous,
  events,
  navEventId,
  navEventType,
  publish,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const isConstructor = isConstructorRoute(pathname, navEventId);

  return (
    <div className="dashboard-shell min-h-screen bg-[var(--dash-light-bg)] text-neutral-900">
      <header
        style={isConstructor ? undefined : LIGHT_HEADER_VARS}
        className="flex flex-wrap items-center justify-between gap-y-2 border-b border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 py-4 sm:px-6"
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-base font-semibold tracking-tight text-[var(--dash-text)]"
          >
            <InvitelyLogo />
            Invitely
          </Link>
          <span className="hidden h-4 w-px bg-[var(--dash-border)] sm:block" />
          <EventSwitcher events={events} currentEventId={navEventId} />
        </div>
        <div className="flex items-center gap-2">
          {publish && (
            <Link
              href={`/e/${publish.slug}`}
              target="_blank"
              rel="noreferrer"
              title={`View public site (/e/${publish.slug})`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--dash-border)] text-[var(--dash-text-muted)] transition hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
            >
              <ExternalLink className="h-[18px] w-[18px]" />
            </Link>
          )}
          <UserMenu userEmail={userEmail} planEventId={navEventId} />
          {publish && <PublishToggle eventId={publish.eventId} status={publish.status ?? "draft"} />}
        </div>
      </header>

      <AnonymousAccountBanner isAnonymous={isAnonymous} />

      <div className="flex flex-col sm:flex-row">
        <DashboardNav eventId={navEventId} eventType={navEventType} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-10 sm:py-10">
          {children}
          <FunnelNav eventId={navEventId} eventType={navEventType} />
        </main>
      </div>

      <SupportWidget />
    </div>
  );
}
