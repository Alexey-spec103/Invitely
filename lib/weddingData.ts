import { getEventType } from "@/lib/eventTypes";

interface WeddingDataEvent {
  event_type: string;
  subtitle_names: string[] | null;
  event_date: string | null;
  venue_name: string | null;
  venue_city: string | null;
  venue_address: string | null;
}

/** The single "wedding data" completeness score shown on the hub -- name(s),
 * date, and venue are the fields every module and the paper set draw from,
 * so this is the one place that decides what counts as "filled". */
export function getWeddingDataCompleteness(event: WeddingDataEvent) {
  const isCouple = getEventType(event.event_type).namesMode === "couple";
  const checks = [
    Boolean(event.subtitle_names?.[0]?.trim()),
    !isCouple || Boolean(event.subtitle_names?.[1]?.trim()),
    Boolean(event.event_date),
    Boolean(event.venue_name?.trim()),
    Boolean(event.venue_city?.trim()),
    Boolean(event.venue_address?.trim()),
  ];

  const filled = checks.filter(Boolean).length;
  const total = checks.length;
  return { filled, total, percent: Math.round((filled / total) * 100) };
}
