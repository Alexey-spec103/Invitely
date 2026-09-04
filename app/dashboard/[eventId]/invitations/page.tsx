import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/session";
import { getEventById } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";
import { getTheme, DEFAULT_THEME_ID } from "@/lib/themes";
import { romanticBlush } from "@/lib/themes/romantic-blush";
import { parseContent } from "@/components/sections/registry";
import { parseCanvasFrames } from "@/lib/canvas/parse";
import { getWeddingDataCompleteness } from "@/lib/weddingData";
import { plans, DEFAULT_PLAN_ID } from "@/lib/plans";
import InvitationDownloads from "./InvitationDownloads";
import PaperEditor from "./PaperEditor";
import HubOverviewStrip from "../HubOverviewStrip";

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
  const [{ data: siteConfig }, { data: guests }] = await Promise.all([
    supabase
      .from("site_config")
      .select("theme_id, content, layout_mode, canvas")
      .eq("event_id", event.id)
      .maybeSingle(),
    supabase.from("guests").select("*").eq("event_id", event.id).order("created_at"),
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
  const mapContent =
    typeof content.map === "object" && content.map !== null
      ? (content.map as Record<string, unknown>)
      : {};
  const primaryVenue =
    Array.isArray(mapContent.venues) &&
    typeof mapContent.venues[0] === "object" &&
    mapContent.venues[0] !== null
      ? (mapContent.venues[0] as Record<string, unknown>)
      : {};
  const venueName = typeof primaryVenue.name === "string" ? primaryVenue.name : undefined;
  const venueAddress = typeof primaryVenue.address === "string" ? primaryVenue.address : undefined;

  const timelineContent =
    typeof content.timeline === "object" && content.timeline !== null
      ? (content.timeline as Record<string, unknown>)
      : {};
  const timelineEvents = Array.isArray(timelineContent.events)
    ? timelineContent.events
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .map((item) => ({
          time: typeof item.time === "string" ? item.time : "",
          title: typeof item.title === "string" ? item.title : "",
          description: typeof item.description === "string" ? item.description : undefined,
        }))
    : [];
  const timelineTitle = typeof timelineContent.title === "string" ? timelineContent.title : undefined;

  const dressCodeContent =
    typeof content.dressCode === "object" && content.dressCode !== null
      ? (content.dressCode as Record<string, unknown>)
      : {};
  const dressCodeTitle = typeof dressCodeContent.title === "string" ? dressCodeContent.title : "";
  const dressCodeDescription =
    typeof dressCodeContent.description === "string" ? dressCodeContent.description : undefined;
  const dressCodeColors = Array.isArray(dressCodeContent.colors)
    ? dressCodeContent.colors
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .map((item) => ({
          hex: typeof item.hex === "string" ? item.hex : "",
          label: typeof item.label === "string" ? item.label : undefined,
        }))
        .filter((color) => color.hex)
    : [];

  const invitationsContent =
    typeof content.invitations === "object" && content.invitations !== null
      ? (content.invitations as Record<string, unknown>)
      : {};
  const backMessage =
    typeof invitationsContent.backMessage === "string" ? invitationsContent.backMessage : "";

  const { percent: weddingDataPercent } = getWeddingDataCompleteness(event);
  const plan = plans[event.plan_id ?? DEFAULT_PLAN_ID] ?? plans[DEFAULT_PLAN_ID];

  return (
    <div className="max-w-3xl">
      <h1 className="dash-h1 text-gray-900">Invitations</h1>
      <p className="mt-1 text-sm text-gray-500">
        Design your paper card, then download a print-ready PDF invitation, on-brand with your
        chosen theme.
      </p>

      <div className="mt-6">
        <HubOverviewStrip
          eventId={event.id}
          themeName={theme.name}
          weddingDataPercent={weddingDataPercent}
          planName={plan.name}
          planPriceEur={plan.priceEur}
        />
      </div>

      <PaperEditor
        eventId={event.id}
        theme={theme}
        names={event.subtitle_names?.length ? event.subtitle_names : [event.title]}
        eventDate={event.event_date}
        venueName={venueName}
        venueAddress={venueAddress}
        timelineTitle={timelineTitle}
        timelineEvents={timelineEvents}
        dressCodeTitle={dressCodeTitle}
        dressCodeDescription={dressCodeDescription}
        dressCodeColors={dressCodeColors}
        backMessage={backMessage}
      />

      <InvitationDownloads
        theme={theme}
        slug={event.slug}
        names={event.subtitle_names?.length ? event.subtitle_names : [event.title]}
        eventDate={event.event_date}
        venueName={venueName}
        venueAddress={venueAddress}
        timelineTitle={timelineTitle}
        timelineEvents={timelineEvents}
        canvasFrames={canvasFrames}
        backMessage={backMessage || undefined}
        dressCodeTitle={dressCodeTitle}
        dressCodeDescription={dressCodeDescription}
        dressCodeColors={dressCodeColors}
        guests={(guests ?? []).map((guest) => ({
          id: guest.id,
          fullName: guest.full_name,
          inviteCode: guest.invite_code,
        }))}
      />
    </div>
  );
}
