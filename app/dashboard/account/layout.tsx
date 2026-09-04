import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/session";
import { listEvents } from "@/lib/events";
import DashboardShell from "../DashboardShell";

export default async function AccountLayout({ children }: LayoutProps<"/dashboard/account">) {
  const user = await getAuthedUser();

  if (!user) {
    redirect("/login");
  }

  const events = await listEvents(user.id);

  if (events.length === 0) {
    redirect("/onboarding");
  }

  return (
    <DashboardShell userEmail={user.email ?? ""} events={events} navEventId={events[0].id} navEventType={events[0].event_type}>
      {children}
    </DashboardShell>
  );
}
