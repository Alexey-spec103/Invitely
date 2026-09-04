import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalLink, UserRound } from "lucide-react";
import DashboardNav from "./DashboardNav";
import PublishToggle from "./PublishToggle";
import EventSwitcher from "./EventSwitcher";

interface DashboardShellEvent {
  id: string;
  title: string;
  event_type: string;
  status: string | null;
}

interface DashboardShellProps {
  userEmail: string;
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
  events,
  navEventId,
  navEventType,
  publish,
  children,
}: DashboardShellProps) {
  return (
    <div className="dashboard-shell min-h-screen bg-[var(--dash-light-bg)] text-neutral-900">
      <header className="flex flex-wrap items-center justify-between gap-y-2 border-b border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <Link href="/dashboard" className="text-base font-semibold tracking-tight text-[var(--dash-text)]">
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
          <Link
            href="/dashboard/account"
            title={userEmail}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--dash-border)] text-[var(--dash-text-muted)] transition hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
          >
            <UserRound className="h-[18px] w-[18px]" />
          </Link>
          {publish && <PublishToggle eventId={publish.eventId} status={publish.status ?? "draft"} />}
        </div>
      </header>

      <div className="flex flex-col sm:flex-row">
        <DashboardNav eventId={navEventId} eventType={navEventType} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-10 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
