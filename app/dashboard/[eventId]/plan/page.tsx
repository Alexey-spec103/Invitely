import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/session";
import { getEventById } from "@/lib/events";
import { getEventType } from "@/lib/eventTypes";
import { DEFAULT_PLAN_ID } from "@/lib/plans";
import { resolveGuestLocale } from "@/lib/i18n/resolveLocale";
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

  const locale = await resolveGuestLocale();

  return (
    <>
      <PlanSelectForm eventId={event.id} currentPlanId={event.plan_id ?? DEFAULT_PLAN_ID} locale={locale} />
      <DeleteEventSection
        eventId={event.id}
        eventTitle={event.title}
        seatingLabel={getEventType(event.event_type).seatingLabel}
      />
    </>
  );
}
