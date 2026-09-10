import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/session";
import { getEventById } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";
import { getTheme, DEFAULT_THEME_ID } from "@/lib/themes";
import { romanticBlush } from "@/lib/themes/romantic-blush";
import { parseContent } from "@/components/sections/registry";
import { getPaperContent } from "@/lib/paperContent";
import { getBanquetCardData } from "@/lib/banquetCards";
import { getEventType } from "@/lib/eventTypes";
import PaperConstructor from "./PaperConstructor";
import HubOverviewStrip from "../HubOverviewStrip";
import FirstVisitTour from "@/components/ui/FirstVisitTour";
import { getWeddingDataCompleteness } from "@/lib/weddingData";
import { plans, DEFAULT_PLAN_ID, isPremiumPlan } from "@/lib/plans";

export default async function PaperPage({ params }: PageProps<"/dashboard/[eventId]/paper">) {
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
  const { data: siteConfig } = await supabase
    .from("site_config")
    .select("theme_id, content")
    .eq("event_id", event.id)
    .maybeSingle();

  let theme;
  try {
    theme = getTheme(siteConfig?.theme_id ?? DEFAULT_THEME_ID);
  } catch {
    theme = romanticBlush;
  }

  const content = siteConfig ? parseContent(siteConfig.content) : {};
  const paperContent = getPaperContent(content);
  const banquetCardData = await getBanquetCardData(event.id);

  const { percent: weddingDataPercent } = getWeddingDataCompleteness(event);
  const plan = plans[event.plan_id ?? DEFAULT_PLAN_ID] ?? plans[DEFAULT_PLAN_ID];
  // dashboard-audit.md B21: banquet/table-card materials are a Premium-tier
  // feature in lib/plans.ts -- this is what actually enforces that now.
  const locked = !isPremiumPlan(plan.id);

  return (
    <div className="max-w-3xl">
      <h1 className="dash-h1 text-gray-900">Paper</h1>
      <p className="mt-1 text-sm text-gray-500">
        Design and edit the invitation, envelope, and other print materials — download the finished PDFs from Invitations.
      </p>

      <FirstVisitTour
        tourId="paper-constructor"
        steps={[
          {
            title: "👋 Welcome to your paper set",
            body: "The list on the left is every printable piece — invitation, envelope, program, and more, grouped by kind.",
          },
          {
            title: "🔍 Zoom and flip",
            body: "Use − / + to zoom the preview, and \"↺ Flip to back\" on the invitation to see the reverse side.",
          },
          {
            title: "🖊️ Design the back",
            body: "The back of your invitation is its own small canvas — add text, a photo, or a QR code. It saves itself as you go.",
          },
          {
            title: "💍 Where the data comes from",
            body: "Names, date, venue, timeline and dress code are edited in the Site tab — update them there and these cards follow automatically.",
          },
          {
            title: "🍽️ Banquet materials",
            body: "Seating charts, place cards and table numbers preview one card at a time — use the arrows to flip through the rest.",
          },
          {
            title: "⬇️ Download when ready",
            body: "Each \"Download all\" button turns every card in that set into a ready-to-print PDF.",
          },
          {
            title: "💬 Stuck on something?",
            body: "The button in the bottom-left corner reaches a real person on our support team, any time.",
          },
        ]}
      />

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

      <PaperConstructor
        eventId={event.id}
        eventType={event.event_type}
        theme={theme}
        names={event.subtitle_names?.length ? event.subtitle_names : [event.title]}
        eventDate={event.event_date}
        venueName={paperContent.venueName}
        venueAddress={paperContent.venueAddress}
        timelineTitle={paperContent.timelineTitle}
        timelineEvents={paperContent.timelineEvents}
        dressCodeTitle={paperContent.dressCodeTitle}
        dressCodeDescription={paperContent.dressCodeDescription}
        dressCodeColors={paperContent.dressCodeColors}
        backMessage={paperContent.backMessage}
        backCanvas={paperContent.backCanvas}
        tableCardData={banquetCardData.tableCardData}
        tableNames={banquetCardData.tableNames}
        allGuestNames={banquetCardData.allGuestNames}
        placeCardsFilteredByRsvp={banquetCardData.hasRsvpData}
        seatingLabel={getEventType(event.event_type).seatingLabel}
        locked={locked}
      />
    </div>
  );
}
