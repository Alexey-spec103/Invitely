import { createClient } from "@/lib/supabase/server";
import { parseSections, parseContent } from "@/components/sections/registry";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function parseFloatingDateTime(dateStr: string, timeStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour = 0, minute = 0, second = 0] = timeStr.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, second);
}

function formatFloatingIcsDateTime(date: Date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function formatUtcIcsDateTime(date: Date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function escapeIcsText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*, site_config(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (!event || !event.site_config) {
    return new Response("Not found", { status: 404 });
  }

  const sections = parseSections(event.site_config.sections).filter((section) => section.enabled);
  const content = parseContent(event.site_config.content);

  const start = parseFloatingDateTime(event.event_date, event.event_time ?? "00:00:00");
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);

  const hasMap = sections.some((section) => section.type === "map");
  const mapContent =
    hasMap && typeof content.map === "object" && content.map !== null
      ? (content.map as Record<string, unknown>)
      : {};
  const primaryVenue =
    Array.isArray(mapContent.venues) &&
    typeof mapContent.venues[0] === "object" &&
    mapContent.venues[0] !== null
      ? (mapContent.venues[0] as Record<string, unknown>)
      : {};
  const venueName = typeof primaryVenue.name === "string" ? primaryVenue.name : "";
  const venueAddress = typeof primaryVenue.address === "string" ? primaryVenue.address : "";
  const location = [venueName, venueAddress].filter(Boolean).join(", ");

  const summary = event.title;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Invitely//Event Site//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@invitely.app`,
    `DTSTAMP:${formatUtcIcsDateTime(new Date())}`,
    `DTSTART:${formatFloatingIcsDateTime(start)}`,
    `DTEND:${formatFloatingIcsDateTime(end)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    ...(location ? [`LOCATION:${escapeIcsText(location)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="event.ics"',
    },
  });
}
