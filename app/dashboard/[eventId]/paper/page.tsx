import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/session";
import { getEventById } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";
import { getTheme, applyColorVariant, DEFAULT_THEME_ID } from "@/lib/themes";
import { romanticBlush } from "@/lib/themes/romantic-blush";
import { parseContent } from "@/components/sections/registry";
import { parseCanvasFrames } from "@/lib/canvas/parse";
import { getPaperContent } from "@/lib/paperContent";
import { getBanquetCardData } from "@/lib/banquetCards";
import { getEventType } from "@/lib/eventTypes";
import PaperConstructor from "./PaperConstructor";
import HubOverviewStrip from "../HubOverviewStrip";
import FirstVisitTour from "@/components/ui/FirstVisitTour";
import PremiumUpgradeNote from "@/components/paper/PremiumUpgradeNote";
import InvitationDownloads from "../invitations/InvitationDownloads";
import { getWeddingDataCompleteness } from "@/lib/weddingData";
import { plans, DEFAULT_PLAN_ID, planMeets } from "@/lib/plans";
import { resolveGuestLocale } from "@/lib/i18n/resolveLocale";

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

  const locale = await resolveGuestLocale();

  const supabase = await createClient();
  const [{ data: siteConfig }, { data: guests }] = await Promise.all([
    supabase
      .from("site_config")
      .select("theme_id, color_variant_id, content, layout_mode, canvas")
      .eq("event_id", event.id)
      .maybeSingle(),
    supabase.from("guests").select("id, full_name, invite_code, paper_enabled").eq("event_id", event.id).order("created_at"),
  ]);

  let theme;
  try {
    theme = applyColorVariant(getTheme(siteConfig?.theme_id ?? DEFAULT_THEME_ID), siteConfig?.color_variant_id);
  } catch {
    theme = romanticBlush;
  }

  const content = siteConfig ? parseContent(siteConfig.content) : {};
  const paperContent = getPaperContent(content);
  const banquetCardData = await getBanquetCardData(event.id);
  const canvasFrames = siteConfig?.layout_mode === "canvas" ? parseCanvasFrames(siteConfig.canvas) : [];
  // dashboard-audit.md A7: a guest whose invitation has the paper toggle off
  // (site-only) shouldn't show up in "Personalized invitations" at all --
  // not just be skipped from "Download all".
  const paperInvitationGuests = (guests ?? [])
    .filter((guest) => guest.paper_enabled)
    .map((guest) => ({ id: guest.id, fullName: guest.full_name, inviteCode: guest.invite_code }));

  const { percent: weddingDataPercent } = getWeddingDataCompleteness(event);
  const plan = plans[event.plan_id ?? DEFAULT_PLAN_ID] ?? plans[DEFAULT_PLAN_ID];
  // dashboard-audit.md B21: paper/banquet materials download fully usable
  // on every plan, watermarked below Premium -- this is what enforces that.
  const locked = !planMeets(plan.id, "premium");

  return (
    <div className="max-w-3xl">
      <h1 className="dash-h1 text-gray-900">Paper</h1>
      <p className="mt-1 text-sm text-gray-500">
        Design, personalize, and download every printable piece — invitation, envelope, seating cards, and more.
      </p>

      {/* Direct feedback: "за 35 евро сразу предупреждать" -- everything on
          this page is the paid/print side of the product, so a host should
          know that up front, not discover it three groups deep in the media
          list. locked-and-per-group notes inside PaperConstructor still do
          their own job (right next to the specific watermarked preview);
          this is the immediate, page-level heads-up. */}
      {locked && (
        <div className="mt-4">
          <PremiumUpgradeNote eventId={event.id} />
        </div>
      )}

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
        frontCanvas={paperContent.frontCanvas}
        envelopeCanvas={paperContent.envelopeCanvas}
        programCanvas={paperContent.programCanvas}
        dressCodeCanvas={paperContent.dressCodeCanvas}
        saveTheDateCanvas={paperContent.saveTheDateCanvas}
        thankYouCanvas={paperContent.thankYouCanvas}
        tableCardData={banquetCardData.tableCardData}
        tableNames={banquetCardData.tableNames}
        allGuestNames={banquetCardData.allGuestNames}
        placeCardsFilteredByRsvp={banquetCardData.hasRsvpData}
        seatingLabel={getEventType(event.event_type).seatingLabel}
        locked={locked}
        locale={locale}
      />

      {/* Direct feedback: this used to be its own "Invitations" tab --
          confusing next to Paper's own "Invitation" design group above,
          and it meant downloading the thing you'd just designed was a
          second navigation away. Personalized (QR-linked, per-guest)
          downloads now live right here, after the design itself. */}
      <div className="mt-10">
        <h2 className="dash-h2 text-lg text-[var(--dash-accent-text)]">Download</h2>
        <p className="mt-1 text-sm text-gray-500">
          Each guest gets a QR code linking straight to your site with them already identified, so their RSVP is
          matched automatically.
        </p>
        <InvitationDownloads
          eventId={event.id}
          theme={theme}
          slug={event.slug}
          names={event.subtitle_names?.length ? event.subtitle_names : [event.title]}
          eventDate={event.event_date}
          venueName={paperContent.venueName}
          venueAddress={paperContent.venueAddress}
          timelineTitle={paperContent.timelineTitle}
          timelineEvents={paperContent.timelineEvents}
          canvasFrames={canvasFrames}
          backMessage={paperContent.backMessage || undefined}
          backCanvas={paperContent.backCanvas}
          frontCanvas={paperContent.frontCanvas}
          envelopeCanvas={paperContent.envelopeCanvas}
          programCanvas={paperContent.programCanvas}
          dressCodeCanvas={paperContent.dressCodeCanvas}
          saveTheDateCanvas={paperContent.saveTheDateCanvas}
          thankYouCanvas={paperContent.thankYouCanvas}
          dressCodeTitle={paperContent.dressCodeTitle}
          dressCodeDescription={paperContent.dressCodeDescription}
          dressCodeColors={paperContent.dressCodeColors}
          guests={paperInvitationGuests}
          locked={locked}
          locale={locale}
        />
      </div>
    </div>
  );
}
