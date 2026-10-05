import { redirect } from "next/navigation";

// Direct feedback: Banquet used to be its own tab mixing table/guest
// assignment (free, digital) with a printable-card showcase (paid) -- which
// read as "this whole tab costs money" even though seating itself never
// did. Split for real now: assigning guests to tables lives on Guests (see
// guests/page.tsx's own "Seating" section), and the printable
// seating-chart/place-card/table-number materials live on Paper (already
// had its own "Banquet" media group). This route just forwards any old
// link/bookmark to Guests, where the actual seating work happens.
export default async function BanquetRedirectPage({
  params,
}: PageProps<"/dashboard/[eventId]/banquet">) {
  const { eventId } = await params;
  redirect(`/dashboard/${eventId}/guests`);
}
