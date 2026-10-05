import { redirect } from "next/navigation";

// Direct feedback: "Invitations" (personalized QR-code PDF downloads) and
// Paper's own "Invitation" design group read as two different things with
// almost the same name -- confusing, and it meant downloading the thing you
// just designed was a second navigation away. That download UI now lives
// directly on Paper (see paper/page.tsx's own "Download" section, right
// after PaperConstructor) -- this route just forwards any old link/bookmark
// there instead of 404ing.
export default async function InvitationsRedirectPage({
  params,
}: PageProps<"/dashboard/[eventId]/invitations">) {
  const { eventId } = await params;
  redirect(`/dashboard/${eventId}/paper`);
}
