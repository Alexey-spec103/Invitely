/** Shared by the Paper constructor and the Invitations finish screen -- both
 * need the same venue/timeline/dress-code/back-message fields pulled out of
 * `site_config.content`, just for different purposes (live editing vs. PDF
 * generation). Kept here once rather than duplicated in each page.tsx. */

import type { CanvasFrame } from "@/lib/canvas/types";

export interface PaperTimelineEvent {
  time: string;
  title: string;
  description?: string;
}

export interface PaperDressCodeColor {
  hex: string;
  label?: string;
}

export interface PaperContent {
  venueName?: string;
  venueAddress?: string;
  timelineTitle?: string;
  timelineEvents: PaperTimelineEvent[];
  dressCodeTitle: string;
  dressCodeDescription?: string;
  dressCodeColors: PaperDressCodeColor[];
  backMessage: string;
  /** Canvas design for the invitation's back side (dashboard-audit.md A9) --
   * undefined until the host opens the Back canvas editor for the first
   * time, at which point it's seeded from `backMessage` and persisted. */
  backCanvas?: CanvasFrame;
}

export function getPaperContent(content: Record<string, unknown>): PaperContent {
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
  const backCanvas =
    typeof invitationsContent.backCanvas === "object" && invitationsContent.backCanvas !== null
      ? (invitationsContent.backCanvas as unknown as CanvasFrame)
      : undefined;

  return {
    venueName,
    venueAddress,
    timelineTitle,
    timelineEvents,
    dressCodeTitle,
    dressCodeDescription,
    dressCodeColors,
    backMessage,
    backCanvas,
  };
}
