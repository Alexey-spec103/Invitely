import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/session";
import { getEventById } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";
import { getTheme, DEFAULT_THEME_ID } from "@/lib/themes";
import { romanticBlush } from "@/lib/themes/romantic-blush";
import { parseContent } from "@/components/sections/registry";
import { parseCanvasFrames } from "@/lib/canvas/parse";
import { getPaperContent } from "@/lib/paperContent";
import { getBanquetCardData } from "@/lib/banquetCards";
import { getWeddingDataCompleteness } from "@/lib/weddingData";
import { plans, DEFAULT_PLAN_ID, isPremiumPlan } from "@/lib/plans";
import InvitationDownloads from "./InvitationDownloads";
import InvitationsShowcase from "./InvitationsShowcase";
import InvitationStats from "./InvitationStats";
import HubOverviewStrip from "../HubOverviewStrip";
import SupportCard from "../../SupportCard";

export default async function InvitationsPage({
  params,
}: PageProps<"/dashboard/[eventId]/invitations">) {
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
  const [{ data: siteConfig }, { data: guests }, { data: rsvpResponses }, { data: giftPreferences }, banquetCardData] =
    await Promise.all([
      supabase
        .from("site_config")
        .select("theme_id, content, layout_mode, canvas")
        .eq("event_id", event.id)
        .maybeSingle(),
      supabase.from("guests").select("*").eq("event_id", event.id).order("created_at"),
      supabase.from("rsvp_responses").select("attending").eq("event_id", event.id),
      supabase.from("gift_preferences").select("id").eq("event_id", event.id),
      getBanquetCardData(event.id),
    ]);

  const canvasFrames =
    siteConfig?.layout_mode === "canvas" ? parseCanvasFrames(siteConfig.canvas) : [];

  let theme;
  try {
    theme = getTheme(siteConfig?.theme_id ?? DEFAULT_THEME_ID);
  } catch {
    theme = romanticBlush;
  }

  const content = siteConfig ? parseContent(siteConfig.content) : {};
  const paperContent = getPaperContent(content);

  const heroContent =
    typeof content.hero === "object" && content.hero !== null
      ? (content.hero as Record<string, unknown>)
      : {};
  const heroPhotoUrl = typeof heroContent.photoUrl === "string" ? heroContent.photoUrl : undefined;

  const { percent: weddingDataPercent } = getWeddingDataCompleteness(event);
  const plan = plans[event.plan_id ?? DEFAULT_PLAN_ID] ?? plans[DEFAULT_PLAN_ID];
  // dashboard-audit.md B21: personalized invitations and banquet/table-card
  // materials are both Premium-tier features in lib/plans.ts -- this is
  // what actually enforces that now (a watermark, not a hard paywall).
  const locked = !isPremiumPlan(plan.id);

  // dashboard-audit.md A7: a guest whose invitation has the paper toggle off
  // (site-only) shouldn't show up in "Personalized invitations" at all --
  // not just be skipped from "Download all".
  const paperInvitationGuests = (guests ?? [])
    .filter((guest) => guest.paper_enabled)
    .map((guest) => ({
      id: guest.id,
      fullName: guest.full_name,
      inviteCode: guest.invite_code,
    }));

  const names = event.subtitle_names?.length ? event.subtitle_names : [event.title];

  // dashboard-audit.md B22: "Приглашений" / "Гостей" are two different real
  // numbers here (sent vs. total), not weddingpost.ru's separate
  // invitation/guest entities -- same idea, honestly mapped onto Invitely's
  // actual per-guest model.
  const invitationsSent = (guests ?? []).filter((guest) => guest.invitation_sent_at != null).length;
  const confirmedCount = (rsvpResponses ?? []).filter((response) => response.attending).length;
  const giftWishesCount = (giftPreferences ?? []).length;

  return (
    <div className="max-w-5xl">
      <h1 className="dash-h1 text-gray-900">Invitations</h1>
      <p className="mt-1 text-sm text-gray-500">
        Download each guest&apos;s personalized, print-ready PDF and track who&apos;s been sent one — change the design itself on the Paper tab.
      </p>

      <div className="mt-6">
        <HubOverviewStrip
          eventId={event.id}
          eventType={event.event_type}
          themeName={theme.name}
          weddingDataPercent={weddingDataPercent}
          planName={plan.name}
          planPriceEur={plan.priceEur}
        />
      </div>

      <div className="mt-6">
        <SupportCard />
      </div>

      <InvitationsShowcase
        eventId={event.id}
        slug={event.slug}
        status={event.status ?? "draft"}
        customDomain={event.custom_domain}
        customDomainVerifiedAt={event.custom_domain_verified_at}
        theme={theme}
        names={names}
        eventDate={event.event_date}
        venueName={paperContent.venueName}
        venueAddress={paperContent.venueAddress}
        heroPhotoUrl={heroPhotoUrl}
        timelineEvents={paperContent.timelineEvents}
        dressCodeColors={paperContent.dressCodeColors}
        tableCardData={banquetCardData.tableCardData}
        tableNames={banquetCardData.tableNames}
        allGuestNames={banquetCardData.allGuestNames}
        locked={locked}
      />

      <InvitationDownloads
        eventId={event.id}
        theme={theme}
        slug={event.slug}
        names={names}
        eventDate={event.event_date}
        venueName={paperContent.venueName}
        venueAddress={paperContent.venueAddress}
        timelineTitle={paperContent.timelineTitle}
        timelineEvents={paperContent.timelineEvents}
        canvasFrames={canvasFrames}
        backMessage={paperContent.backMessage || undefined}
        backCanvas={paperContent.backCanvas}
        dressCodeTitle={paperContent.dressCodeTitle}
        dressCodeDescription={paperContent.dressCodeDescription}
        dressCodeColors={paperContent.dressCodeColors}
        guests={paperInvitationGuests}
        locked={locked}
      />

      <div className="mt-6">
        <InvitationStats
          invitationsSent={invitationsSent}
          guestsCount={(guests ?? []).length}
          confirmedCount={confirmedCount}
          giftWishesCount={giftWishesCount}
        />
      </div>
    </div>
  );
}
