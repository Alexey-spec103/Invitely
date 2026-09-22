import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EVENT_COLUMNS } from "@/lib/events";
import { getTheme } from "@/lib/themes";
import { romanticBlush } from "@/lib/themes/romantic-blush";
import { parseSections, parseContent, renderSection, sectionWillRender, SECTION_LABELS } from "@/components/sections/registry";
import ThemeProvider from "@/components/theme/ThemeProvider";
import RevealOnScroll from "@/components/RevealOnScroll";
import SiteHeader from "@/components/shell/SiteHeader";
import ScrollToNextSection from "@/components/shell/ScrollToNextSection";
import CanvasRenderer from "@/components/canvas/CanvasRenderer";
import SectionBackground from "@/components/background/SectionBackground";
import { parseCanvasFrames } from "@/lib/canvas/parse";
import { submitRsvp, lookupGuestTable } from "./actions";
import SitePasswordGate from "./SitePasswordGate";
import EnvelopeReveal from "@/components/site/EnvelopeReveal";
import { getInviteDescription, formatEventDate } from "@/lib/socialPreview";
import { planMeets, BASIC_GATED_SECTION_TYPES } from "@/lib/plans";
import { getEventType } from "@/lib/eventTypes";
import PublicSiteBadge from "@/components/site/PublicSiteBadge";
import { effectiveDecorCategory } from "@/lib/themes/decorMotifs";
import { resolveGuestLocale } from "@/lib/i18n/resolveLocale";
import { SUPPORTED_LOCALES } from "@/lib/i18n/locales";

export async function generateMetadata({
  params,
}: PageProps<"/e/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("title, event_date, site_config(content)")
    .eq("slug", slug)
    .maybeSingle();

  if (!event) {
    return { title: "Event not found" };
  }

  const description = getInviteDescription(event.event_date);

  // dashboard-audit.md B14 "Превью": a custom social-share image, falling
  // back to the start-screen (Hero) photo -- without either, the link card
  // guests see when this URL is pasted into a messenger has no image at all.
  const content =
    typeof event.site_config?.content === "object" && event.site_config.content !== null
      ? (event.site_config.content as Record<string, unknown>)
      : {};
  const settings =
    typeof content.settings === "object" && content.settings !== null
      ? (content.settings as Record<string, unknown>)
      : {};
  const hero = typeof content.hero === "object" && content.hero !== null ? (content.hero as Record<string, unknown>) : {};
  const socialImageUrl =
    (typeof settings.socialImageUrl === "string" && settings.socialImageUrl) ||
    (typeof hero.photoUrl === "string" && hero.photoUrl) ||
    undefined;

  return {
    title: event.title,
    description,
    openGraph: {
      title: event.title,
      description,
      type: "website",
      images: socialImageUrl ? [socialImageUrl] : undefined,
    },
  };
}

export default async function Page({ params, searchParams }: PageProps<"/e/[slug]">) {
  const { slug } = await params;
  const { invite } = await searchParams;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select(`${EVENT_COLUMNS}, site_config(*)`)
    .eq("slug", slug)
    .maybeSingle();

  if (!event || !event.site_config) {
    notFound();
  }

  // Guest-facing UI chrome locale -- see resolveGuestLocale.ts's own comment
  // for the priority order (guest's own explicit choice, then geo-IP, then
  // English) and for why events.supported_locales isn't consulted yet.
  // Resolved this early (not just before render) so the bound submitRsvp
  // Server Action below can localize its own error messages too.
  const locale = await resolveGuestLocale();

  // Password protection: a hashed-password gate on top of the existing
  // publish gate above (an unpublished event is already invisible to guests
  // regardless of this). `site_password_hash` itself is never read here --
  // its column-level SELECT is revoked at the DB level (see the site-password
  // migration) -- only the opaque unlock token, which is safe to compare.
  if (event.site_password_enabled) {
    const cookieStore = await cookies();
    const unlocked =
      event.site_password_unlock_token != null &&
      cookieStore.get(`site_unlock_${event.id}`)?.value === event.site_password_unlock_token;
    if (!unlocked) {
      return <SitePasswordGate eventId={event.id} title={event.title} />;
    }
  }

  // dashboard-audit.md Block E: a host on any plan can toggle modules,
  // design in Canvas, and save freely in the dashboard -- that's the free
  // "try it" part. This is the one place both gates actually apply to what
  // guests see.
  const hasBasicAccess = planMeets(event.plan_id, "basic");

  // Block E part 3: saveCanvasFrames/setLayoutMode persist unconditionally
  // on every plan (never silently discarding a host's design) -- but the
  // public site only actually renders Canvas mode once the plan meets
  // Basic, falling back to the structured section layout otherwise (which
  // still has a real Hero section to show, seeded when the event was
  // created) rather than unlocking the free-form cover for free.
  const isCanvasMode = event.site_config.layout_mode === "canvas" && hasBasicAccess;

  // Canvas mode replaces the decorative "Home" cover with freely designed
  // pages, but reuses the same functional sections (RSVP, timeline, map,
  // gifts, ...) rather than reimplementing that logic — guest lookup, RSVP
  // persistence, and banquet linking all live in one place regardless of
  // which layout mode a couple picked for their cover pages.
  // Block E part 1: modules filtered here, not at the toggle, so the
  // enforcement can't be bypassed by editing content after publish without
  // re-toggling.
  const allSections = parseSections(event.site_config.sections)
    .filter((section) => section.enabled)
    .filter(
      (section) =>
        hasBasicAccess || !BASIC_GATED_SECTION_TYPES.includes(section.type as (typeof BASIC_GATED_SECTION_TYPES)[number])
    );
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
    invitedGuest?.max_plus_ones ?? null,
    locale
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

  // EnvelopeReveal reuses the Hero section's own names/date content when it
  // exists, so a host's custom monogram or wording carries over -- falling
  // back to the event's own subtitle_names/event_date for canvas-mode sites,
  // which have no Hero content block at all.
  const heroContent =
    typeof content.hero === "object" && content.hero !== null ? (content.hero as Record<string, unknown>) : {};
  const envelopeNames =
    Array.isArray(heroContent.names) && heroContent.names.every((name): name is string => typeof name === "string") && heroContent.names.length > 0
      ? heroContent.names
      : (event.subtitle_names?.length ? event.subtitle_names : [event.title]);
  // Same "only reformat what actually looks like a raw ISO date" rule as
  // HeroSection.tsx's own dispatcher -- content.hero.eventDate is seeded
  // as the raw "YYYY-MM-DD" value at event creation (lib/events.ts) and
  // only ever becomes a human string once a host edits Wedding Data, so
  // both shapes have to be handled here too, not just the fallback.
  const rawEnvelopeDate =
    typeof heroContent.eventDate === "string" && heroContent.eventDate ? heroContent.eventDate : event.event_date;
  const envelopeDate = /^\d{4}-\d{2}-\d{2}$/.test(rawEnvelopeDate) ? formatEventDate(rawEnvelopeDate) : rawEnvelopeDate;
  const envelopeMonogramInitials =
    typeof heroContent.monogramInitials === "string" ? heroContent.monogramInitials : undefined;
  const envelopeRevealEnabled = typeof settings.envelopeRevealEnabled === "boolean" ? settings.envelopeRevealEnabled : true;

  // `luxury` themes resolve to a same-lightness substitute category here
  // (see decorMotifs.ts's own comment) so every luxury event still gets a
  // real decorative asset instead of the plain accent-tinted mask fallback.
  const decorCategory = effectiveDecorCategory(theme);

  return (
    <>
      {envelopeRevealEnabled && (
        <EnvelopeReveal
          eventId={event.id}
          theme={theme}
          names={envelopeNames}
          eventDate={envelopeDate}
          monogramInitials={envelopeMonogramInitials}
          guestName={invitedGuest?.full_name}
          locale={locale}
        />
      )}
      {isCanvasMode && <CanvasRenderer frames={parseCanvasFrames(event.site_config.canvas)} />}
      <ThemeProvider theme={theme}>
        <SiteHeader
          sections={navItems}
          calendarHref={`/e/${slug}/calendar.ics`}
          musicUrl={musicUrl}
          eventTitle={event.title}
          locale={locale}
          availableLocales={SUPPORTED_LOCALES}
        />
        {sections.map((section, index) => {
          const element = renderSection(section, content, {
            hero: { themeCategory: decorCategory, eyebrow: getEventType(event.event_type).heroEyebrow },
            letter: { themeCategory: decorCategory },
            rsvp: { onSubmit: boundSubmitRsvp, defaultGuestName: invitedGuest?.full_name, maxPartySize },
            countdown: { eventDateTime, themeCategory: decorCategory },
            gift: { preferences: giftItems, themeCategory: decorCategory },
            dressCode: { themeCategory: decorCategory },
            guestbook: { messages: guestbookMessages },
            banquetNavigator: { onLookup: boundLookupGuestTable, assignedTableName },
          }, locale);
          if (!element) {
            return null;
          }
          const wrapped = (
            <div key={section.type} id={`section-${section.type}`}>
              <SectionBackground fill={section.background}>{element}</SectionBackground>
            </div>
          );
          // The first section normally skips the reveal-on-scroll animation
          // since it's already visible on load — but in canvas mode the
          // canvas frames sit above it, so even the first functional
          // section starts off-screen and should animate in like the rest.
          return index === 0 && !isCanvasMode ? wrapped : <RevealOnScroll key={section.type}>{wrapped}</RevealOnScroll>;
        })}
        {!isCanvasMode && sections.length > 1 && <ScrollToNextSection />}
        {!hasBasicAccess && <PublicSiteBadge />}
      </ThemeProvider>
    </>
  );
}
