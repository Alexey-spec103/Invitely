import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/session";
import { getEventById } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";
import { getTheme, DEFAULT_THEME_ID } from "@/lib/themes";
import { romanticBlush } from "@/lib/themes/romantic-blush";
import { getEventType } from "@/lib/eventTypes";
import BanquetTablesManager from "./BanquetTablesManager";
import GuestTableAssignments from "./GuestTableAssignments";
import BanquetCardDownloads from "./BanquetCardDownloads";

export default async function BanquetPage({ params }: PageProps<"/dashboard/[eventId]/banquet">) {
  const { eventId } = await params;
  const user = await getAuthedUser();

  if (!user) {
    redirect("/login");
  }

  const event = await getEventById(eventId, user.id);

  if (!event) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const [{ data: siteConfig }, { data: guests }, { data: tables }, { data: rsvpResponses }] = await Promise.all([
    supabase.from("site_config").select("theme_id").eq("event_id", event.id).maybeSingle(),
    supabase.from("guests").select("*").eq("event_id", event.id).order("created_at"),
    supabase.from("banquet_tables").select("*").eq("event_id", event.id).order("created_at"),
    supabase.from("rsvp_responses").select("guest_id, attending").eq("event_id", event.id),
  ]);

  const guestList = guests ?? [];
  const guestIds = guestList.map((guest) => guest.id);
  const { data: attendees } =
    guestIds.length > 0
      ? await supabase.from("guest_attendees").select("*").in("guest_id", guestIds)
      : { data: [] as never[] };
  const attendeeList = attendees ?? [];

  // Seating happens after RSVPs are in, specifically to seat only confirmed
  // guests -- without this, bulk-assign (built for 100+-guest lists) would
  // silently seat declined guests, inflating capacity warnings and printing
  // them onto table/place cards.
  const attendingStatusByGuestId = new Map(
    (rsvpResponses ?? [])
      .filter((response) => response.guest_id)
      .map((response) => [response.guest_id as string, response.attending])
  );

  let theme;
  try {
    theme = getTheme(siteConfig?.theme_id ?? DEFAULT_THEME_ID);
  } catch {
    theme = romanticBlush;
  }

  const tableList = tables ?? [];

  // A guest record is the invited party's primary contact; named attendees
  // are everyone else in that party. Table/place cards need every actual
  // name, not just the contact's name repeated once per party.
  const namesForGuest = (guestId: string, fullName: string) => [
    fullName,
    ...attendeeList.filter((attendee) => attendee.guest_id === guestId).map((attendee) => attendee.full_name),
  ];

  const tableCardData = tableList.map((table) => ({
    name: table.name,
    guestNames: guestList
      .filter((guest) => guest.table_id === table.id)
      .flatMap((guest) => namesForGuest(guest.id, guest.full_name)),
  }));

  // "Download all place cards" bypasses table assignment entirely, so it
  // never inherited round 20's RSVP-aware bulk-assign filter -- a host who
  // carefully seated only confirmed guests could still print place cards
  // for everyone who declined or never responded. Same conditional-filter
  // rule as GuestTableAssignments' "Attending only" default: only exclude
  // non-attendees once there's actual RSVP data to filter by, so a host
  // previewing cards before any RSVPs are in still sees every guest.
  const hasRsvpData = attendingStatusByGuestId.size > 0;
  const allGuestNames = guestList
    .filter((guest) => !hasRsvpData || attendingStatusByGuestId.get(guest.id) === true)
    .flatMap((guest) => namesForGuest(guest.id, guest.full_name));

  const seatedCount = guestList.filter((guest) => guest.table_id != null).length;
  const withoutTableCount = guestList.length - seatedCount;
  const confirmedCount = hasRsvpData
    ? guestList.filter((guest) => attendingStatusByGuestId.get(guest.id) === true).length
    : 0;
  const confirmedPercent = guestList.length > 0 ? Math.round((confirmedCount / guestList.length) * 100) : 0;
  const seatedOfConfirmedCount = hasRsvpData
    ? guestList.filter((guest) => guest.table_id != null && attendingStatusByGuestId.get(guest.id) === true).length
    : 0;
  const seatedOfConfirmedPercent = confirmedCount > 0 ? Math.round((seatedOfConfirmedCount / confirmedCount) * 100) : 0;

  return (
    <div>
      {guestList.length > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
            <p className="text-gray-500">Without a table</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{withoutTableCount}</p>
          </div>
          {hasRsvpData ? (
            <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
              <p className="text-gray-500">
                Confirmations <span className="font-semibold text-emerald-700">{confirmedCount}/{guestList.length}</span>
              </p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200">
                <div
                  className="h-1.5 rounded-full bg-emerald-500"
                  style={{ width: `${confirmedPercent}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">{confirmedPercent}% confirmed attending</p>
            </div>
          ) : (
            <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
              <p className="text-gray-500">Confirmations</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">—</p>
            </div>
          )}
          <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
            {hasRsvpData ? (
              <>
                <p className="text-gray-500">
                  Seated <span className="font-semibold text-gray-900">{seatedOfConfirmedCount}/{confirmedCount}</span>
                </p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200">
                  <div
                    className="h-1.5 rounded-full bg-gray-900"
                    style={{ width: `${seatedOfConfirmedPercent}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">{seatedOfConfirmedPercent}% of confirmed guests seated</p>
              </>
            ) : (
              <>
                <p className="text-gray-500">Seated</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{seatedCount}</p>
              </>
            )}
          </div>
        </div>
      )}

      <BanquetTablesManager eventId={event.id} tables={tableList} label={getEventType(event.event_type).seatingLabel} />

      <GuestTableAssignments
        guests={guestList}
        tables={tableList}
        attendees={attendeeList}
        attendingStatusByGuestId={Object.fromEntries(attendingStatusByGuestId)}
      />

      <BanquetCardDownloads
        theme={theme}
        tables={tableCardData}
        allGuestNames={allGuestNames}
        placeCardsFilteredByRsvp={hasRsvpData}
      />
    </div>
  );
}
