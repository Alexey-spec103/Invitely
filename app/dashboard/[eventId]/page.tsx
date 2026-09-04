import { redirect } from "next/navigation";

/** No standalone hub/overview screen (matches weddingpost.ru — every nav
 * item leads straight into its own live editor, never an intermediate
 * summary page). This route only exists so a bare event URL (bookmarks,
 * old links) doesn't 404. */
export default async function EventDashboardIndex({ params }: PageProps<"/dashboard/[eventId]">) {
  const { eventId } = await params;
  redirect(`/dashboard/${eventId}/site`);
}
