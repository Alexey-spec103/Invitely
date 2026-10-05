import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/session";
import { getEventById } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";
import { getTheme, DEFAULT_THEME_ID } from "@/lib/themes";
import { romanticBlush } from "@/lib/themes/romantic-blush";
import { parseContent, parseSections } from "@/components/sections/registry";
import GuestManager from "./GuestManager";
import RsvpResponses from "./RsvpResponses";
import GuestListDownload from "./GuestListDownload";
import SupportCard from "../../SupportCard";
import { formatAnswers } from "./formatAnswers";
import BanquetTablesManager from "../banquet/BanquetTablesManager";
import GuestTableAssignments from "../banquet/GuestTableAssignments";
import RsvpNotificationToggle from "./RsvpNotificationToggle";
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

  // Direct feedback: this column (20260930130000_rsvp_email_notifications_
  // toggle.sql) may not exist yet in a database where that migration hasn't
  // been applied by hand -- fetched in its own narrow query (never folded
  // into lib/events.ts's shared EVENT_COLUMNS, see that file's own comment)
  // so a not-yet-applied migration only reverts this one toggle to its
  // default (notifications on) instead of breaking every page that loads
  // this event.
  const { data: notificationSettings } = await supabase
    .from("events")
    .select("rsvp_email_notifications")
    .eq("id", event.id)
    .maybeSingle();
  const rsvpEmailNotifications = notificationSettings?.rsvp_email_notifications ?? true;

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
    .select("theme_id, content, sections")
    .eq("event_id", event.id)
    .maybeSingle();
  const content = siteConfig ? parseContent(siteConfig.content) : {};
  const banquetNavigatorEnabled =
    (siteConfig ? parseSections(siteConfig.sections) : []).find((section) => section.type === "banquetNavigator")
      ?.enabled ?? false;

  const { data: banquetTables } = await supabase
    .from("banquet_tables")
    .select("*")
    .eq("event_id", event.id)
    .order("created_at");
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
  // dashboard-audit critique 2026-10-04 (bug-hunt round 5): a guest who was
  // never sent an invite has no response either, so the old filter counted
  // them in BOTH buckets at once -- confirmed live, a single never-contacted
  // guest inflated the header's total past the real guest count. "Awaiting
  // response" should mean "sent, no reply yet", which is what the per-row
  // status just below already does (`guestListRows`'s "Awaiting response" vs
  // "Not contacted" branches) -- this just brings the summary counts in
  // line with that same, already-correct distinction.
  const noResponseCount = allGuests.filter(
    (guest) => !respondedGuestIds.has(guest.id) && guest.invitation_sent_at != null
  ).length;
  // Same fix, the other direction: a guest who already responded (e.g. via
  // the shared site link, never individually sent an invite) was still
  // being counted here too, since this only checked invitation_sent_at and
  // ignored whether they'd responded -- they'd show up as both "attending"
  // and "not yet contacted" at once.
  const notSentCount = allGuests.filter(
    (guest) => guest.invitation_sent_at == null && !respondedGuestIds.has(guest.id)
  ).length;

  let theme;
  try {
    theme = getTheme(siteConfig?.theme_id ?? DEFAULT_THEME_ID);
  } catch {
    theme = romanticBlush;
  }

  const responseByGuestId = new Map(
    allResponses.filter((response) => response.guest_id).map((response) => [response.guest_id, response])
  );
  const attendingStatusByGuestId = Object.fromEntries(
    allResponses.filter((response) => response.guest_id).map((response) => [response.guest_id as string, response.attending])
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
        <div className="mt-4 flex flex-wrap gap-4 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
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

      <div className="mt-6">
        <SupportCard />
      </div>

      <GuestManager
        eventId={event.id}
        eventSlug={event.slug}
        eventTitle={event.title}
        guests={allGuests}
        attendees={attendees ?? []}
        rsvpStatusByGuestId={Object.fromEntries(
          Array.from(responseByGuestId.entries()).map(([guestId, response]) => [
            guestId,
            response.attending,
          ])
        )}
      />

      <RsvpNotificationToggle eventId={event.id} enabled={rsvpEmailNotifications} />

      <RsvpResponses
        eventId={event.id}
        responses={allResponses}
        guests={allGuests}
        questions={rsvpQuestions}
      />

      {/* Direct feedback: this used to live on its own Banquet tab, mixed in
          with the printable-card showcase -- which read as "that whole tab
          costs money" even though seating itself is free, and it meant a
          host had to jump between three tabs (Guests to add people,
          Banquet to seat them, Invitations to download their cards) for one
          connected task. Entirely optional -- nothing here is required for
          the site or RSVP to work, and it stays exactly as useful whether
          or not "Find My Table" is even turned on. */}
      <div className="mt-10 border-t border-gray-200 pt-8">
        <h2 className="dash-h2 text-lg text-[var(--dash-accent-text)]">Seating</h2>
        <p className="mt-1 text-sm text-gray-500">
          {banquetNavigatorEnabled
            ? "Optional — who sits where. This is what powers the “Find My Table” search on your site."
            : "Optional — plan who sits where whenever you like. Turn on “Find My Table” in your Site’s Modules list to let guests look it up themselves."}
        </p>
        <div className="mt-4">
          <BanquetTablesManager eventId={event.id} tables={banquetTables ?? []} guests={allGuests} attendees={attendees ?? []} />
        </div>
        <GuestTableAssignments
          eventId={event.id}
          guests={allGuests}
          tables={banquetTables ?? []}
          attendees={attendees ?? []}
          attendingStatusByGuestId={attendingStatusByGuestId}
        />
      </div>

      <GuestListDownload theme={theme} eventTitle={event.title} rows={guestListRows} />
    </div>
  );
}
