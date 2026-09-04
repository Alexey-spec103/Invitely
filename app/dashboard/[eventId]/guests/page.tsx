import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/session";
import { getEventById } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";
import { getTheme, DEFAULT_THEME_ID } from "@/lib/themes";
import { romanticBlush } from "@/lib/themes/romantic-blush";
import { parseContent } from "@/components/sections/registry";
import GuestManager from "./GuestManager";
import RsvpResponses from "./RsvpResponses";
import GuestListDownload from "./GuestListDownload";
import { formatAnswers } from "./formatAnswers";
import type { GuestListRow } from "@/components/pdf/GuestListDocument";

export default async function GuestsPage({ params }: PageProps<"/dashboard/[eventId]/guests">) {
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
  const { data: guests } = await supabase
    .from("guests")
    .select("*")
    .eq("event_id", event.id)
    .order("created_at");

  const guestIds = (guests ?? []).map((guest) => guest.id);
  const { data: attendees } =
    guestIds.length > 0
      ? await supabase.from("guest_attendees").select("*").in("guest_id", guestIds).order("created_at")
      : { data: [] as never[] };

  const { data: rsvpResponses } = await supabase
    .from("rsvp_responses")
    .select("*")
    .eq("event_id", event.id)
    .order("submitted_at", { ascending: false });

  const { data: siteConfig } = await supabase
    .from("site_config")
    .select("theme_id, content")
    .eq("event_id", event.id)
    .maybeSingle();
  const content = siteConfig ? parseContent(siteConfig.content) : {};

  const { data: banquetTables } = await supabase
    .from("banquet_tables")
    .select("id, name")
    .eq("event_id", event.id);
  const tableNameById = new Map((banquetTables ?? []).map((table) => [table.id, table.name]));
  const rsvpContent =
    typeof content.rsvp === "object" && content.rsvp !== null
      ? (content.rsvp as Record<string, unknown>)
      : {};
  const rsvpQuestions = Array.isArray(rsvpContent.questions)
    ? rsvpContent.questions
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .map((item) => ({
          id: typeof item.id === "string" ? item.id : "",
          label: typeof item.label === "string" ? item.label : "",
        }))
    : [];

  const allGuests = guests ?? [];
  const allResponses = rsvpResponses ?? [];
  const attendingCount = allResponses.filter((response) => response.attending).length;
  const notAttendingCount = allResponses.filter((response) => !response.attending).length;
  const respondedGuestIds = new Set(allResponses.map((response) => response.guest_id).filter(Boolean));
  const noResponseCount = allGuests.filter((guest) => !respondedGuestIds.has(guest.id)).length;
  const notSentCount = allGuests.filter((guest) => guest.invitation_sent_at == null).length;

  let theme;
  try {
    theme = getTheme(siteConfig?.theme_id ?? DEFAULT_THEME_ID);
  } catch {
    theme = romanticBlush;
  }

  const responseByGuestId = new Map(
    allResponses.filter((response) => response.guest_id).map((response) => [response.guest_id, response])
  );
  const attendeesByGuestId = (attendees ?? []).reduce<Map<string, string[]>>((map, attendee) => {
    const names = map.get(attendee.guest_id) ?? [];
    names.push(attendee.full_name);
    map.set(attendee.guest_id, names);
    return map;
  }, new Map());
  const guestListRows: GuestListRow[] = allGuests.map((guest) => {
    const response = responseByGuestId.get(guest.id);
    const partyNames = attendeesByGuestId.get(guest.id) ?? [];
    const customAnswers = formatAnswers(response?.meal_preferences ?? null, rsvpQuestions);
    return {
      name: [guest.full_name, ...partyNames].join(", "),
      group: guest.group_label ?? "",
      status: response
        ? response.attending
          ? "Attending"
          : "Not attending"
        : guest.invitation_sent_at
          ? "Awaiting response"
          : "Not contacted",
      partySize: response?.attending ? String(response.party_size ?? 1) : "",
      table: guest.table_id ? (tableNameById.get(guest.table_id) ?? "") : "",
      notes: [response?.allergies, ...customAnswers.map((a) => `${a.label}: ${a.answer}`)]
        .filter(Boolean)
        .join(" · "),
    };
  });

  return (
    <div className="max-w-2xl">
      <h1 className="dash-h1 text-gray-900">Guests</h1>
      <p className="mt-1 text-sm text-gray-500">
        Keep track of everyone you&apos;re inviting.
      </p>

      {allGuests.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 rounded-md border border-gray-200 border-l-4 border-l-[var(--dash-accent)] bg-gray-50 px-4 py-3 text-sm">
          <span className="text-emerald-700">
            <span className="font-semibold">{attendingCount}</span> attending
          </span>
          <span className="text-gray-500">
            <span className="font-semibold">{notAttendingCount}</span> not attending
          </span>
          <span className="text-amber-700">
            <span className="font-semibold">{noResponseCount}</span> awaiting response
          </span>
          <span className="text-gray-500">
            <span className="font-semibold">{notSentCount}</span> not yet contacted
          </span>
        </div>
      )}

      <GuestManager
        eventId={event.id}
        eventSlug={event.slug}
        guests={allGuests}
        attendees={attendees ?? []}
        rsvpStatusByGuestId={Object.fromEntries(
          Array.from(responseByGuestId.entries()).map(([guestId, response]) => [
            guestId,
            response.attending,
          ])
        )}
      />

      <RsvpResponses
        eventId={event.id}
        responses={allResponses}
        guests={allGuests}
        questions={rsvpQuestions}
      />

      <GuestListDownload theme={theme} eventTitle={event.title} rows={guestListRows} />
    </div>
  );
}
