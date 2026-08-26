import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthedUser } from "@/lib/session";
import { getEventById, listEvents } from "@/lib/events";
import DashboardNav from "../DashboardNav";
import PublishToggle from "../PublishToggle";
import EventSwitcher from "../EventSwitcher";

export default async function EventDashboardLayout({
  children,
  params,
}: LayoutProps<"/dashboard/[eventId]">) {
  const { eventId } = await params;
  const user = await getAuthedUser();

  if (!user) {
    redirect("/login");
  }

  const event = await getEventById(eventId, user.id);

  if (!event) {
    redirect("/dashboard");
  }

  const events = await listEvents(user.id);

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="flex flex-wrap items-center justify-between gap-y-2 border-b border-stone-200 bg-white px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <Link href="/dashboard" className="text-base font-semibold tracking-tight text-stone-900">
            Invitely
          </Link>
          <span className="hidden h-4 w-px bg-stone-200 sm:block" />
          <EventSwitcher events={events} currentEventId={event.id} />
          <span className="hidden h-4 w-px bg-stone-200 sm:block" />
          <Link href="/dashboard/account" className="text-stone-500 underline underline-offset-2 hover:text-stone-900">
            {user.email}
          </Link>
          <Link
            href={`/e/${event.slug}`}
            className="text-rose-700 underline underline-offset-2 hover:text-rose-800"
          >
            /e/{event.slug}
          </Link>
        </div>
        <PublishToggle eventId={event.id} status={event.status ?? "draft"} />
      </header>

      <div className="flex flex-col sm:flex-row">
        <DashboardNav eventId={eventId} eventType={event.event_type} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-10 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
