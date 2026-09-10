import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/session";
import { getEventById, listEvents } from "@/lib/events";
import DashboardShell from "../DashboardShell";

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
    <DashboardShell
      userEmail={user.email ?? ""}
      isAnonymous={user.is_anonymous ?? false}
      events={events}
      navEventId={event.id}
      navEventType={event.event_type}
      publish={{ eventId: event.id, status: event.status, slug: event.slug }}
    >
      {children}
    </DashboardShell>
  );
}
