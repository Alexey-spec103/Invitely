import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/session";
import { listEvents } from "@/lib/events";

export default async function DashboardRootPage() {
  const user = await getAuthedUser();

  if (!user) {
    redirect("/login");
  }

  const events = await listEvents(user.id);

  if (events.length === 0) {
    redirect("/onboarding");
  }

  redirect(`/dashboard/${events[0].id}/site`);
}
