/** Shared by the Banquet tab's own download buttons and the Paper
 * constructor's Banquet media group -- both need the same table/place-card
 * data derived from `guests`/`banquet_tables`/`guest_attendees`/`rsvp_responses`,
 * just for different UI. Kept here once rather than duplicated. */

import { createClient } from "@/lib/supabase/server";
import type { TableCardData } from "@/components/pdf/TableCardDocument";

export interface BanquetCardData {
  tableCardData: TableCardData[];
  tableNames: string[];
  allGuestNames: string[];
  /** True once at least one RSVP has come in -- "place cards"/"table
   * numbers" only exclude non-attendees once there's real RSVP data to
   * filter by, so a host previewing cards before any RSVPs are in still
   * sees every guest (same rule Banquet's own bulk-assign uses). */
  hasRsvpData: boolean;
}

export async function getBanquetCardData(eventId: string): Promise<BanquetCardData> {
  const supabase = await createClient();

  const [{ data: guests }, { data: tables }, { data: rsvpResponses }] = await Promise.all([
    supabase.from("guests").select("*").eq("event_id", eventId).order("created_at"),
    supabase.from("banquet_tables").select("*").eq("event_id", eventId).order("created_at"),
    supabase.from("rsvp_responses").select("guest_id, attending").eq("event_id", eventId),
  ]);

  const guestList = guests ?? [];
  const guestIds = guestList.map((guest) => guest.id);
  const { data: attendees } =
    guestIds.length > 0
      ? await supabase.from("guest_attendees").select("*").in("guest_id", guestIds)
      : { data: [] as never[] };
  const attendeeList = attendees ?? [];

  const attendingStatusByGuestId = new Map(
    (rsvpResponses ?? [])
      .filter((response) => response.guest_id)
      .map((response) => [response.guest_id as string, response.attending])
  );

  const tableList = tables ?? [];

  // A guest record is the invited party's primary contact; named attendees
  // are everyone else in that party. Table/place cards need every actual
  // name, not just the contact's name repeated once per party.
  const namesForGuest = (guestId: string, fullName: string) => [
    fullName,
    ...attendeeList.filter((attendee) => attendee.guest_id === guestId).map((attendee) => attendee.full_name),
  ];

  const tableCardData: TableCardData[] = tableList.map((table) => ({
    name: table.name,
    guestNames: guestList
      .filter((guest) => guest.table_id === table.id)
      .flatMap((guest) => namesForGuest(guest.id, guest.full_name)),
  }));

  const hasRsvpData = attendingStatusByGuestId.size > 0;
  const allGuestNames = guestList
    .filter((guest) => !hasRsvpData || attendingStatusByGuestId.get(guest.id) === true)
    .flatMap((guest) => namesForGuest(guest.id, guest.full_name));

  return {
    tableCardData,
    tableNames: tableList.map((table) => table.name),
    allGuestNames,
    hasRsvpData,
  };
}
