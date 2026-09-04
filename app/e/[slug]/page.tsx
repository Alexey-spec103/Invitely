import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTheme } from "@/lib/themes";
import { romanticBlush } from "@/lib/themes/romantic-blush";
import { parseSections, parseContent, renderSection, sectionWillRender, SECTION_LABELS } from "@/components/sections/registry";
import ThemeProvider from "@/components/theme/ThemeProvider";
import RevealOnScroll from "@/components/RevealOnScroll";
import SiteHeader from "@/components/shell/SiteHeader";
import ScrollToNextSection from "@/components/shell/ScrollToNextSection";
import CanvasRenderer from "@/components/canvas/CanvasRenderer";
import { parseCanvasFrames } from "@/lib/canvas/parse";
import { submitRsvp, lookupGuestTable } from "./actions";

function formatEventDate(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export async function generateMetadata({
  params,
}: PageProps<"/e/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("title, event_date")
    .eq("slug", slug)
    .maybeSingle();

  if (!event) {
    return { title: "Event not found" };
  }

  const description = `You're invited — ${formatEventDate(event.event_date)}. See the details and RSVP.`;

  return {
    title: event.title,
    description,
    openGraph: {
      title: event.title,
      description,
      type: "website",
    },
  };
}

export default async function Page({ params, searchParams }: PageProps<"/e/[slug]">) {
  const { slug } = await params;
  const { invite } = await searchParams;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*, site_config(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (!event || !event.site_config) {
    notFound();
  }

  const isCanvasMode = event.site_config.layout_mode === "canvas";

  // Canvas mode replaces the decorative "Home" cover with freely designed
  // pages, but reuses the same functional sections (RSVP, timeline, map,
  // gifts, ...) rather than reimplementing that logic — guest lookup, RSVP
  // persistence, and banquet linking all live in one place regardless of
  // which layout mode a couple picked for their cover pages.
  const allSections = parseSections(event.site_config.sections).filter((section) => section.enabled);
  const sections = isCanvasMode ? allSections.filter((section) => section.type !== "hero") : allSections;
  const content = parseContent(event.site_config.content);

  let invitedGuest: {
    id: string;
    full_name: string;
    max_plus_ones: number | null;
    table_name: string | null;
  } | null = null;
  if (typeof invite === "string" && invite) {
    const { data: guest } = await supabase
      .rpc("lookup_guest_by_invite_code", { p_event_id: event.id, p_invite_code: invite })
      .maybeSingle();
    invitedGuest = guest;
  }

  const boundSubmitRsvp = submitRsvp.bind(
    null,
    event.id,
    invitedGuest?.id ?? null,
    invitedGuest?.max_plus_ones ?? null
  );
  const maxPartySize =
    invitedGuest?.max_plus_ones != null ? invitedGuest.max_plus_ones + 1 : undefined;
  const assignedTableName = invitedGuest?.table_name ?? undefined;
  const boundLookupGuestTable = lookupGuestTable.bind(null, event.id);

  const settings =
    typeof content.settings === "object" && content.settings !== null
      ? (content.settings as Record<string, unknown>)
      : {};
  const musicUrl = typeof settings.musicUrl === "string" ? settings.musicUrl : undefined;

  const navItems = sections
    .filter((section) => sectionWillRender(section, content))
    .map((section) => ({
      type: section.type,
      label: SECTION_LABELS[section.type],
    }));

  const eventDateTime = `${event.event_date}T${event.event_time ?? "00:00:00"}`;

  const hasGiftSection = sections.some((section) => section.type === "gift");
  const { data: giftPreferences } = hasGiftSection
    ? await supabase
        .from("gift_preferences")
        .select("*")
        .eq("event_id", event.id)
        .order("order_index")
    : { data: [] as never[] };
  const giftItems = (giftPreferences ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    type: item.type,
    url: item.url,
    imageUrl: item.image_url,
    description: item.description,
  }));

  const hasGuestbookSection = sections.some((section) => section.type === "guestbook");
  const { data: guestbookRows } = hasGuestbookSection
    ? await supabase.rpc("get_guestbook_messages", { p_event_id: event.id })
    : { data: [] as never[] };
  const guestbookMessages = (guestbookRows ?? []).map((row) => ({
    guestName: row.guest_name,
    comment: row.comment,
    submittedAt: row.submitted_at,
  }));

  let theme;
  try {
    theme = getTheme(event.site_config.theme_id);
  } catch {
    theme = romanticBlush;
  }

  return (
    <>
      {isCanvasMode && <CanvasRenderer frames={parseCanvasFrames(event.site_config.canvas)} />}
      <ThemeProvider theme={theme}>
        <SiteHeader
          sections={navItems}
          calendarHref={`/e/${slug}/calendar.ics`}
          musicUrl={musicUrl}
          eventTitle={event.title}
        />
        {sections.map((section, index) => {
          const element = renderSection(section, content, {
            rsvp: { onSubmit: boundSubmitRsvp, defaultGuestName: invitedGuest?.full_name, maxPartySize },
            countdown: { eventDateTime },
            gift: { preferences: giftItems },
            guestbook: { messages: guestbookMessages },
            banquetNavigator: { onLookup: boundLookupGuestTable, assignedTableName },
          });
          if (!element) {
            return null;
          }
          const wrapped = (
            <div key={section.type} id={`section-${section.type}`}>
              {element}
            </div>
          );
          // The first section normally skips the reveal-on-scroll animation
          // since it's already visible on load — but in canvas mode the
          // canvas frames sit above it, so even the first functional
          // section starts off-screen and should animate in like the rest.
          return index === 0 && !isCanvasMode ? wrapped : <RevealOnScroll key={section.type}>{wrapped}</RevealOnScroll>;
        })}
        {!isCanvasMode && sections.length > 1 && <ScrollToNextSection />}
      </ThemeProvider>
    </>
  );
}
