import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/session";
import { getEventById } from "@/lib/events";
import { DEFAULT_PLAN_ID } from "@/lib/plans";
import PlanSelectForm from "./PlanSelectForm";
import DeleteEventSection from "./DeleteEventSection";

export default async function PlanPage({ params }: PageProps<"/dashboard/[eventId]/plan">) {
  const { eventId } = await params;
  const user = await getAuthedUser();

  if (!user) {
    redirect("/login");
  }

  const event = await getEventById(eventId, user.id);

  if (!event) {
    redirect("/dashboard");
  }

  return (
    <>
      <PlanSelectForm eventId={event.id} currentPlanId={event.plan_id ?? DEFAULT_PLAN_ID} />
      <DeleteEventSection eventId={event.id} eventTitle={event.title} />
    </>
  );
}
