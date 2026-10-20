import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/session";
import { listEvents } from "@/lib/events";
import { resolveGuestLocale } from "@/lib/i18n/resolveLocale";
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

  const locale = await resolveGuestLocale();

  return (
    <DashboardShell
      userEmail={user.email ?? ""}
      isAnonymous={user.is_anonymous ?? false}
      events={events}
      navEventId={events[0].id}
      locale={locale}
    >
      {children}
    </DashboardShell>
  );
}
