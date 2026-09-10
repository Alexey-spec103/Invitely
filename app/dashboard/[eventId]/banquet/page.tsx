import { redirect } from "next/navigation";
import { Users, CheckCircle2 } from "lucide-react";
import { getAuthedUser } from "@/lib/session";
import { getEventById } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";
import { getTheme, DEFAULT_THEME_ID } from "@/lib/themes";
import { romanticBlush } from "@/lib/themes/romantic-blush";
import { getEventType } from "@/lib/eventTypes";
import { getWeddingDataCompleteness } from "@/lib/weddingData";
import { plans, DEFAULT_PLAN_ID, isPremiumPlan } from "@/lib/plans";
import BanquetTablesManager from "./BanquetTablesManager";
import BanquetShowcase from "./BanquetShowcase";
import GuestTableAssignments from "./GuestTableAssignments";
import HubOverviewStrip from "../HubOverviewStrip";

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
  // silently seat declined guests, inflating capacity warnings.
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

  // Only exclude non-attendees from the "confirmed"/"seated" stats below
  // once there's actual RSVP data to filter by, so a host previewing this
  // page before any RSVPs are in still sees every guest.
  const hasRsvpData = attendingStatusByGuestId.size > 0;

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
  const seatedPercentOfTotal = guestList.length > 0 ? Math.round((seatedCount / guestList.length) * 100) : 0;

  const { percent: weddingDataPercent } = getWeddingDataCompleteness(event);
  const plan = plans[event.plan_id ?? DEFAULT_PLAN_ID] ?? plans[DEFAULT_PLAN_ID];
  // dashboard-audit.md B21: banquet/table-card materials are a Premium-tier
  // feature in lib/plans.ts -- this is what actually enforces that now.
  const locked = !isPremiumPlan(plan.id);

  const firstTable = tableList[0];
  const firstTableGuestNames = firstTable
    ? guestList.filter((guest) => guest.table_id === firstTable.id).map((guest) => guest.full_name)
    : [];

  return (
    <div>
      <HubOverviewStrip
        eventId={event.id}
        eventType={event.event_type}
        themeName={theme.name}
        weddingDataPercent={weddingDataPercent}
        planName={plan.name}
        planPriceEur={plan.priceEur}
      />

      <div className="mt-6">
        <BanquetShowcase theme={theme} tableName={firstTable?.name} guestNames={firstTableGuestNames} locked={locked} />
      </div>

      {/* dashboard-audit.md B17: weddingpost.ru's own three status pills --
          Без стола / Подтверждения / Рассадка -- confirmed live to always
          render (even at 0/0), with a progress bar on the last two but not
          the first. Matches this page's own HubOverviewStrip pill style
          (icon + bar + percent caption) directly above, rather than the
          plainer bare-number cards this block used to be. */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
            <Users className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
            Without a table
          </p>
          {withoutTableCount === 0 ? (
            guestList.length > 0 ? (
              <p className="mt-3 text-sm font-medium text-emerald-600">All guests are seated</p>
            ) : (
              <p className="mt-3 text-sm text-gray-400">No guests yet</p>
            )
          ) : (
            <p className="mt-3 text-2xl font-semibold text-gray-900">
              {withoutTableCount}
              <span className="ml-1.5 text-sm font-normal text-gray-500">
                guest{withoutTableCount === 1 ? "" : "s"} without a table
              </span>
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
            <Users className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
            Confirmations
          </p>
          <p className="mt-3 text-sm text-gray-500">
            <span className="font-semibold text-gray-900">
              {confirmedCount}/{guestList.length}
            </span>{" "}
            guests confirmed
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200">
            <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${confirmedPercent}%` }} />
          </div>
          <p className="mt-1 text-xs text-gray-400">
            {hasRsvpData ? `${confirmedPercent}% confirmed attending` : "No RSVP responses yet"}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
            Seated
          </p>
          <p className="mt-3 text-sm text-gray-500">
            <span className="font-semibold text-gray-900">
              {hasRsvpData ? seatedOfConfirmedCount : seatedCount}/{hasRsvpData ? confirmedCount : guestList.length}
            </span>{" "}
            seated
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200">
            <div
              className="h-1.5 rounded-full bg-[var(--dash-accent)]"
              style={{ width: `${hasRsvpData ? seatedOfConfirmedPercent : seatedPercentOfTotal}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">
            {hasRsvpData
              ? `${seatedOfConfirmedPercent}% of confirmed guests seated`
              : guestList.length > 0
                ? `${seatedPercentOfTotal}% of guests seated`
                : "No guests yet"}
          </p>
        </div>
      </div>

      <BanquetTablesManager
        eventId={event.id}
        theme={theme}
        tables={tableList}
        guests={guestList}
        attendees={attendeeList}
        label={getEventType(event.event_type).seatingLabel}
        locked={locked}
      />

      <GuestTableAssignments
        guests={guestList}
        tables={tableList}
        attendees={attendeeList}
        attendingStatusByGuestId={Object.fromEntries(attendingStatusByGuestId)}
      />
    </div>
  );
}
