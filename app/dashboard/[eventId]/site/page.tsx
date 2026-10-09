import { redirect } from "next/navigation";
import Link from "next/link";
import { TriangleAlert, ExternalLink } from "lucide-react";
import { getAuthedUser } from "@/lib/session";
import { getEventById } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";
import { parseSections, parseContent } from "@/components/sections/registry";
import { getEventType } from "@/lib/eventTypes";
import { getLocalizedEventType } from "@/lib/eventTypesLocalized";
import SectionModulesPanel from "./SectionModulesPanel";
import FirstVisitTour from "@/components/ui/FirstVisitTour";
import FeatureCarousel from "./FeatureCarousel";
import ModuleCard from "@/components/ui/ModuleCard";
import SiteInlineEditor from "./SiteInlineEditor";
import SiteSettingsEditForm from "./SiteSettingsEditForm";
import LinkPreviewCard from "./LinkPreviewCard";
import DomainEditForm from "./DomainEditForm";
import PasswordProtectionCard from "./PasswordProtectionCard";
import { getInviteDescription } from "@/lib/socialPreview";
import { planMeets, plans } from "@/lib/plans";
import { HERO_VARIANTS, DEFAULT_HERO_VARIANT } from "@/components/sections/HeroSection";
import type { HeroVariant } from "@/components/sections/HeroSection";
import { LETTER_VARIANTS, DEFAULT_LETTER_VARIANT } from "@/components/sections/LetterSection";
import type { LetterVariant } from "@/components/sections/LetterSection";
import { TIMELINE_VARIANTS, DEFAULT_TIMELINE_VARIANT } from "@/components/sections/TimelineSection";
import type { TimelineVariant } from "@/components/sections/TimelineSection";
import { MAP_VARIANTS, DEFAULT_MAP_VARIANT } from "@/components/sections/MapSection";
import type { MapVariant } from "@/components/sections/MapSection";
import { COUNTDOWN_VARIANTS, DEFAULT_COUNTDOWN_VARIANT } from "@/components/sections/CountdownSection";
import type { CountdownVariant } from "@/components/sections/CountdownSection";
import { GIFT_VARIANTS, DEFAULT_GIFT_VARIANT } from "@/components/sections/GiftSection";
import type { GiftVariant } from "@/components/sections/GiftSection";
import { DRESS_CODE_VARIANTS, DEFAULT_DRESS_CODE_VARIANT } from "@/components/sections/DressCodeSection";
import type { DressCodeVariant } from "@/components/sections/DressCodeSection";
import { GUESTBOOK_VARIANTS, DEFAULT_GUESTBOOK_VARIANT } from "@/components/sections/GuestbookSection";
import type { GuestbookVariant } from "@/components/sections/GuestbookSection";
import { VIDEO_VARIANTS, DEFAULT_VIDEO_VARIANT } from "@/components/sections/VideoSection";
import type { VideoVariant } from "@/components/sections/VideoSection";
import { getTheme, applyColorVariant, DEFAULT_THEME_ID } from "@/lib/themes";
import { getWeddingDataCompleteness } from "@/lib/weddingData";
import WeddingDataForm from "../WeddingDataForm";
import EventTypeSwitcher from "../EventTypeSwitcher";
import { resolveGuestLocale } from "@/lib/i18n/resolveLocale";
import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";

function extractStyleOverrides(content: Record<string, unknown>): Record<string, TextStyleOverride> | undefined {
  const overrides = content.styleOverrides;
  return typeof overrides === "object" && overrides !== null
    ? (overrides as Record<string, TextStyleOverride>)
    : undefined;
}

function extractHiddenFields(content: Record<string, unknown>): string[] | undefined {
  const hidden = content.hiddenFields;
  return Array.isArray(hidden) ? (hidden as string[]) : undefined;
}

export default async function SitePage({ params, searchParams }: PageProps<"/dashboard/[eventId]/site">) {
  const { eventId } = await params;
  const { checkout, firstVisit } = await searchParams;
  // Set by OnboardingWizard.tsx's onSubmit on the very first redirect after
  // finishing onboarding -- step 3 of the wizard already built real
  // anticipation with a live preview that updated as the host typed their
  // names, so landing here on the dense module-toggle list and the
  // watermark-upsell banner (both real, useful, but not the payoff that
  // preview promised) undercut it. Only reorders what a FIRST-TIME visit
  // shows first; every later visit to this same page (no query param) keeps
  // the normal order -- settings/modules are exactly what a returning host
  // actually wants quick access to.
  const isFirstVisit = firstVisit === "1";
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
  const { data: siteConfig } = await supabase
    .from("site_config")
    .select("*")
    .eq("event_id", event.id)
    .maybeSingle();

  const heroSection = siteConfig
    ? parseSections(siteConfig.sections).find((section) => section.type === "hero")
    : undefined;
  const heroVariant =
    heroSection && HERO_VARIANTS.includes(heroSection.variant as HeroVariant)
      ? (heroSection.variant as HeroVariant)
      : DEFAULT_HERO_VARIANT;

  const content = siteConfig ? parseContent(siteConfig.content) : {};
  const heroContent =
    typeof content.hero === "object" && content.hero !== null
      ? (content.hero as Record<string, unknown>)
      : {};
  const heroPhotoUrl = typeof heroContent.photoUrl === "string" ? heroContent.photoUrl : "";
  const heroEyebrow = typeof heroContent.eyebrow === "string" ? heroContent.eyebrow : "";
  const heroStyleOverrides = extractStyleOverrides(heroContent);
  const heroHiddenFields = extractHiddenFields(heroContent);
  const letterContent =
    typeof content.letter === "object" && content.letter !== null
      ? (content.letter as Record<string, unknown>)
      : {};
  const letterSection = siteConfig
    ? parseSections(siteConfig.sections).find((section) => section.type === "letter")
    : undefined;
  const letterVariant =
    letterSection && LETTER_VARIANTS.includes(letterSection.variant as LetterVariant)
      ? (letterSection.variant as LetterVariant)
      : DEFAULT_LETTER_VARIANT;
  const letterDefaultValues = {
    title: typeof letterContent.title === "string" ? letterContent.title : "",
    body: typeof letterContent.body === "string" ? letterContent.body : "",
    quote: typeof letterContent.quote === "string" ? letterContent.quote : "",
    note: typeof letterContent.note === "string" ? letterContent.note : "",
    rsvpDeadline: typeof letterContent.rsvpDeadline === "string" ? letterContent.rsvpDeadline : "",
    closingLine: typeof letterContent.closingLine === "string" ? letterContent.closingLine : "",
    letterVariant,
    styleOverrides: extractStyleOverrides(letterContent),
    hiddenFields: extractHiddenFields(letterContent),
  };
  const letterEnabled = letterSection?.enabled ?? false;

  const timelineContentExists = typeof content.timeline === "object" && content.timeline !== null;
  const timelineContent = timelineContentExists ? (content.timeline as Record<string, unknown>) : {};
  // Direct feedback: a brand-new Timeline started from a blank "no events
  // yet" state, so a host had to already know to click "+ Add event" before
  // there was anything to edit -- the section just read as unfinished.
  // Dashboard-editor-only default: one example event, already there to edit
  // or delete, so the section looks filled in from the first click instead
  // of empty. Only applies when `content.timeline` has genuinely never been
  // saved -- an explicitly-saved empty `events: []` (a host who added then
  // deleted every event) is a real choice and stays empty, not re-seeded.
  // Never touches the DB or the public site's own render path
  // (sectionWillRender/renderSection in registry.tsx read straight from
  // stored content, independent of this dashboard-display fallback) -- an
  // untouched example only ever appears here, in the editor.
  const timelineEvents = Array.isArray(timelineContent.events)
    ? timelineContent.events
        .filter(
          (item): item is Record<string, unknown> => typeof item === "object" && item !== null
        )
        .map((item) => ({
          time: typeof item.time === "string" ? item.time : "",
          title: typeof item.title === "string" ? item.title : "",
          description: typeof item.description === "string" ? item.description : "",
        }))
    : timelineContentExists
      ? []
      : [{ time: "4:00 PM", title: "New event", description: "" }];
  const timelineSection = siteConfig
    ? parseSections(siteConfig.sections).find((section) => section.type === "timeline")
    : undefined;
  const timelineVariant =
    timelineSection && TIMELINE_VARIANTS.includes(timelineSection.variant as TimelineVariant)
      ? (timelineSection.variant as TimelineVariant)
      : DEFAULT_TIMELINE_VARIANT;
  const timelineDefaultValues = {
    title: typeof timelineContent.title === "string" ? timelineContent.title : "",
    events: timelineEvents,
    timelineVariant,
    styleOverrides: extractStyleOverrides(timelineContent),
    hiddenFields: extractHiddenFields(timelineContent),
  };
  const timelineEnabled = timelineSection?.enabled ?? false;

  const mapContent =
    typeof content.map === "object" && content.map !== null
      ? (content.map as Record<string, unknown>)
      : {};
  const mapVenues = Array.isArray(mapContent.venues)
    ? mapContent.venues
        .filter(
          (item): item is Record<string, unknown> => typeof item === "object" && item !== null
        )
        .map((item) => ({
          name: typeof item.name === "string" ? item.name : "",
          address: typeof item.address === "string" ? item.address : "",
        }))
    : // Backward-compat for events saved before venues became a list.
      typeof mapContent.venueName === "string" || typeof mapContent.venueAddress === "string"
      ? [
          {
            name: typeof mapContent.venueName === "string" ? mapContent.venueName : "",
            address: typeof mapContent.venueAddress === "string" ? mapContent.venueAddress : "",
          },
        ]
      : [];
  const mapSection = siteConfig
    ? parseSections(siteConfig.sections).find((section) => section.type === "map")
    : undefined;
  const mapVariant =
    mapSection && MAP_VARIANTS.includes(mapSection.variant as MapVariant)
      ? (mapSection.variant as MapVariant)
      : DEFAULT_MAP_VARIANT;
  const mapDefaultValues = {
    title: typeof mapContent.title === "string" ? mapContent.title : "",
    // No venues added to the Map section yet -- pre-fill from the shared
    // wedding-data venue (see WeddingDataForm) instead of starting blank.
    venues:
      mapVenues.length > 0
        ? mapVenues
        : [
            {
              name: event.venue_name ?? "",
              // dashboard-audit.md finding #2: MapVenue has no separate city
              // field (see MapSection/types.ts) -- the embed query in
              // EmbedStatic.tsx geocodes `${name}, ${address}` as one string,
              // so the city has to be folded into that address text here,
              // at the one place a venue gets pre-filled from Wedding Data,
              // rather than left out (confirmed live: without it, a real
              // street address with no city/state resolved to a Google Maps
              // result in Norway).
              address: [event.venue_address, event.venue_city].filter(Boolean).join(", "),
            },
          ],
    mapVariant,
    styleOverrides: extractStyleOverrides(mapContent),
    hiddenFields: extractHiddenFields(mapContent),
  };
  const mapEnabled = mapSection?.enabled ?? false;

  const rsvpSection = siteConfig
    ? parseSections(siteConfig.sections).find((section) => section.type === "rsvp")
    : undefined;
  const rsvpContent =
    typeof content.rsvp === "object" && content.rsvp !== null
      ? (content.rsvp as Record<string, unknown>)
      : {};
  const rsvpQuestions = Array.isArray(rsvpContent.questions)
    ? rsvpContent.questions
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .map((item) => ({
          id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
          label: typeof item.label === "string" ? item.label : "",
          type: item.type === "choice" ? ("choice" as const) : ("text" as const),
          options: Array.isArray(item.options) ? item.options.join(", ") : "",
        }))
    : [];
  const rsvpEnabled = rsvpSection?.enabled ?? false;
  const rsvpDefaultValues = {
    title: typeof rsvpContent.title === "string" ? rsvpContent.title : "",
    description: typeof rsvpContent.description === "string" ? rsvpContent.description : "",
    questions: rsvpQuestions,
    styleOverrides: extractStyleOverrides(rsvpContent),
    hiddenFields: extractHiddenFields(rsvpContent),
  };

  const countdownSection = siteConfig
    ? parseSections(siteConfig.sections).find((section) => section.type === "countdown")
    : undefined;
  const countdownContent =
    typeof content.countdown === "object" && content.countdown !== null
      ? (content.countdown as Record<string, unknown>)
      : {};
  const countdownVariant =
    countdownSection && COUNTDOWN_VARIANTS.includes(countdownSection.variant as CountdownVariant)
      ? (countdownSection.variant as CountdownVariant)
      : DEFAULT_COUNTDOWN_VARIANT;
  const countdownEnabled = countdownSection?.enabled ?? false;
  const countdownDefaultValues = {
    title: typeof countdownContent.title === "string" ? countdownContent.title : "",
    countdownVariant,
    styleOverrides: extractStyleOverrides(countdownContent),
    hiddenFields: extractHiddenFields(countdownContent),
  };

  const giftSection = siteConfig
    ? parseSections(siteConfig.sections).find((section) => section.type === "gift")
    : undefined;
  const giftContent =
    typeof content.gift === "object" && content.gift !== null
      ? (content.gift as Record<string, unknown>)
      : {};
  const giftVariant =
    giftSection && GIFT_VARIANTS.includes(giftSection.variant as GiftVariant)
      ? (giftSection.variant as GiftVariant)
      : DEFAULT_GIFT_VARIANT;
  const giftEnabled = giftSection?.enabled ?? false;
  const giftDefaultValues = {
    title: typeof giftContent.title === "string" ? giftContent.title : "",
    description: typeof giftContent.description === "string" ? giftContent.description : "",
    giftVariant,
    styleOverrides: extractStyleOverrides(giftContent),
    hiddenFields: extractHiddenFields(giftContent),
  };
  const { data: giftPreferences } = await supabase
    .from("gift_preferences")
    .select("*")
    .eq("event_id", event.id)
    .order("order_index");

  const dressCodeSection = siteConfig
    ? parseSections(siteConfig.sections).find((section) => section.type === "dressCode")
    : undefined;
  const dressCodeContent =
    typeof content.dressCode === "object" && content.dressCode !== null
      ? (content.dressCode as Record<string, unknown>)
      : {};
  const dressCodeColors = Array.isArray(dressCodeContent.colors)
    ? dressCodeContent.colors
        .filter(
          (item): item is Record<string, unknown> => typeof item === "object" && item !== null
        )
        .map((item) => ({
          hex: typeof item.hex === "string" ? item.hex : "",
          label: typeof item.label === "string" ? item.label : "",
        }))
    : [];
  const dressCodeVariant =
    dressCodeSection && DRESS_CODE_VARIANTS.includes(dressCodeSection.variant as DressCodeVariant)
      ? (dressCodeSection.variant as DressCodeVariant)
      : DEFAULT_DRESS_CODE_VARIANT;
  const dressCodeEnabled = dressCodeSection?.enabled ?? false;
  const dressCodeDefaultValues = {
    title: typeof dressCodeContent.title === "string" ? dressCodeContent.title : "",
    description:
      typeof dressCodeContent.description === "string" ? dressCodeContent.description : "",
    colors: dressCodeColors,
    dressCodeVariant,
    styleOverrides: extractStyleOverrides(dressCodeContent),
    hiddenFields: extractHiddenFields(dressCodeContent),
  };

  const guestbookSection = siteConfig
    ? parseSections(siteConfig.sections).find((section) => section.type === "guestbook")
    : undefined;
  const guestbookContent =
    typeof content.guestbook === "object" && content.guestbook !== null
      ? (content.guestbook as Record<string, unknown>)
      : {};
  const guestbookVariant =
    guestbookSection && GUESTBOOK_VARIANTS.includes(guestbookSection.variant as GuestbookVariant)
      ? (guestbookSection.variant as GuestbookVariant)
      : DEFAULT_GUESTBOOK_VARIANT;
  const guestbookEnabled = guestbookSection?.enabled ?? false;
  const guestbookDefaultValues = {
    title: typeof guestbookContent.title === "string" ? guestbookContent.title : "",
    guestbookVariant,
    styleOverrides: extractStyleOverrides(guestbookContent),
    hiddenFields: extractHiddenFields(guestbookContent),
  };
  const { data: guestbookRows } = await supabase.rpc("get_guestbook_messages", { p_event_id: event.id });
  const guestbookMessages = (guestbookRows ?? []).map((row) => ({
    guestName: row.guest_name,
    comment: row.comment,
    submittedAt: row.submitted_at,
  }));

  const videoSection = siteConfig
    ? parseSections(siteConfig.sections).find((section) => section.type === "video")
    : undefined;
  const videoContent =
    typeof content.video === "object" && content.video !== null
      ? (content.video as Record<string, unknown>)
      : {};
  const videoVariant =
    videoSection && VIDEO_VARIANTS.includes(videoSection.variant as VideoVariant)
      ? (videoSection.variant as VideoVariant)
      : DEFAULT_VIDEO_VARIANT;
  const videoEnabled = videoSection?.enabled ?? false;
  const videoDefaultValues = {
    title: typeof videoContent.title === "string" ? videoContent.title : "",
    videoUrl: typeof videoContent.videoUrl === "string" ? videoContent.videoUrl : "",
    videoVariant,
    styleOverrides: extractStyleOverrides(videoContent),
    hiddenFields: extractHiddenFields(videoContent),
  };

  const banquetNavigatorSection = siteConfig
    ? parseSections(siteConfig.sections).find((section) => section.type === "banquetNavigator")
    : undefined;
  const banquetNavigatorContent =
    typeof content.banquetNavigator === "object" && content.banquetNavigator !== null
      ? (content.banquetNavigator as Record<string, unknown>)
      : {};
  const banquetNavigatorEnabled = banquetNavigatorSection?.enabled ?? false;
  const banquetNavigatorDefaultValues = {
    title:
      typeof banquetNavigatorContent.title === "string" ? banquetNavigatorContent.title : "Find your table",
    description:
      typeof banquetNavigatorContent.description === "string" ? banquetNavigatorContent.description : "",
    styleOverrides: extractStyleOverrides(banquetNavigatorContent),
    hiddenFields: extractHiddenFields(banquetNavigatorContent),
  };

  const guestNotesSection = siteConfig
    ? parseSections(siteConfig.sections).find((section) => section.type === "guestNotes")
    : undefined;
  const guestNotesContent =
    typeof content.guestNotes === "object" && content.guestNotes !== null
      ? (content.guestNotes as Record<string, unknown>)
      : {};
  const guestNotesEnabled = guestNotesSection?.enabled ?? false;
  const guestNotesDefaultValues = {
    title: typeof guestNotesContent.title === "string" ? guestNotesContent.title : "Good to know",
    body: typeof guestNotesContent.body === "string" ? guestNotesContent.body : "",
    styleOverrides: extractStyleOverrides(guestNotesContent),
    hiddenFields: extractHiddenFields(guestNotesContent),
  };

  const faqSection = siteConfig
    ? parseSections(siteConfig.sections).find((section) => section.type === "faq")
    : undefined;
  const faqContentExists = typeof content.faq === "object" && content.faq !== null;
  const faqContent = faqContentExists ? (content.faq as Record<string, unknown>) : {};
  const faqItems = Array.isArray(faqContent.items)
    ? faqContent.items
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .map((item) => ({
          question: typeof item.question === "string" ? item.question : "",
          answer: typeof item.answer === "string" ? item.answer : "",
        }))
    : faqContentExists
      ? []
      : [{ question: "New question", answer: "" }];
  const faqEnabled = faqSection?.enabled ?? false;
  const faqDefaultValues = {
    title: typeof faqContent.title === "string" ? faqContent.title : "",
    items: faqItems,
    styleOverrides: extractStyleOverrides(faqContent),
    hiddenFields: extractHiddenFields(faqContent),
  };

  const travelSection = siteConfig
    ? parseSections(siteConfig.sections).find((section) => section.type === "travel")
    : undefined;
  const travelContentExists = typeof content.travel === "object" && content.travel !== null;
  const travelContent = travelContentExists ? (content.travel as Record<string, unknown>) : {};
  const travelItems = Array.isArray(travelContent.items)
    ? travelContent.items
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .map((item) => ({
          name: typeof item.name === "string" ? item.name : "",
          description: typeof item.description === "string" ? item.description : "",
          promoCode: typeof item.promoCode === "string" ? item.promoCode : "",
          priceText: typeof item.priceText === "string" ? item.priceText : "",
          bookingUrl: typeof item.bookingUrl === "string" ? item.bookingUrl : "",
        }))
    : travelContentExists
      ? []
      : [{ name: "New place", description: "", promoCode: "", priceText: "", bookingUrl: "" }];
  const travelEnabled = travelSection?.enabled ?? false;
  const travelDefaultValues = {
    title: typeof travelContent.title === "string" ? travelContent.title : "",
    description: typeof travelContent.description === "string" ? travelContent.description : "",
    items: travelItems,
    styleOverrides: extractStyleOverrides(travelContent),
    hiddenFields: extractHiddenFields(travelContent),
  };

  const settingsContent =
    typeof content.settings === "object" && content.settings !== null
      ? (content.settings as Record<string, unknown>)
      : {};
  const siteSettingsDefaultValues = {
    musicUrl: typeof settingsContent.musicUrl === "string" ? settingsContent.musicUrl : "",
  };
  const socialImageUrl = typeof settingsContent.socialImageUrl === "string" ? settingsContent.socialImageUrl : "";
  const envelopeRevealEnabled =
    typeof settingsContent.envelopeRevealEnabled === "boolean" ? settingsContent.envelopeRevealEnabled : true;

  const allSections = siteConfig ? parseSections(siteConfig.sections) : [];
  // dashboard-audit.md Block E: shared across the module lock hints and the
  // custom-domain card below -- both gate on the same Basic threshold.
  const hasBasicAccess = planMeets(event.plan_id, "basic");
  let theme;
  try {
    theme = applyColorVariant(getTheme(siteConfig?.theme_id ?? DEFAULT_THEME_ID), siteConfig?.color_variant_id);
  } catch {
    theme = getTheme(DEFAULT_THEME_ID);
  }

  const onStatus = { label: "On", tone: "on" as const };
  const notSetStatus = { label: "Not set", tone: "off" as const };

  // Wedding data has no separate hub screen anymore (matches weddingpost.ru --
  // its own "Данные свадьбе" data lives behind a button surfaced from inside
  // this same constructor screen, not a standalone tab). Lives as the first
  // card in this grid instead.
  const { percent: weddingDataPercent } = getWeddingDataCompleteness(event);
  const weddingDataDefaultValues = {
    name1: event.subtitle_names?.[0] ?? "",
    name2: event.subtitle_names?.[1] ?? "",
    eventDate: event.event_date,
    venueName: event.venue_name ?? "",
    venueCity: event.venue_city ?? "",
    venueAddress: event.venue_address ?? "",
  };

  // Extracted so isFirstVisit can reorder the two blocks below (preview
  // first, selling/modules second) without duplicating either's JSX --
  // returning the finished site to a first-time visitor before the
  // module-toggle list and watermark-upsell banner, see the isFirstVisit
  // comment above.
  const sellingAndModulesBlock = (
    <>
      <FeatureCarousel />

      <FirstVisitTour
        tourId="site-editor"
        steps={[
          {
            title: "👋 Welcome to your site editor",
            body: "Everything here saves itself as you type — there's no Save button to remember.",
          },
          {
            title: "✏️ Click any text to edit it",
            body: "No separate editor-vs-preview split — click straight on a name, date, or line of copy on the live page below and start typing.",
          },
          {
            title: "📷 Add your photos",
            body: "Drag a photo straight into any photo field. We'll resize it automatically.",
          },
          {
            title: "🧩 Turn modules on or off",
            // dashboard-audit critique 2026-10-04 (onboarding-tour spotlight):
            // was "...inside their card," a leftover from the old per-module
            // ModuleCard scheme this panel replaced -- every toggle already
            // lives right here, so this step now rings-highlights the panel
            // itself instead of describing a layout that no longer exists.
            body: "Countdown, RSVP, gift wishes, dress code and more — each has its own on/off switch right here.",
            targetSelector: "#site-modules-panel",
          },
          {
            title: "🔎 Can't find something?",
            body: "Editable blocks (below the preview) lists every text and photo on your site, grouped by section, so you can jump straight to it.",
            targetSelector: "#editable-blocks-panel",
          },
        ]}
      />

      <SectionModulesPanel
        eventId={event.id}
        sections={allSections}
        hasBasicAccess={hasBasicAccess}
        envelopeRevealEnabled={envelopeRevealEnabled}
      />
    </>
  );

  const previewGrid = (
    <div className="mt-6 lg:grid lg:grid-cols-[420px_1fr] lg:items-start lg:gap-6">
      <div className="flex flex-col gap-2">
        {/* dashboard-audit.md B13: weddingpost.ru's own reminder banner sits
            directly above its inline wedding-data fields, not at the very
            bottom of the page below everything else -- confirmed live: a
            left accent bar, a ⚠ icon, the reminder line, then the CTA
            button below it, not beside it. */}
        {weddingDataPercent < 100 && (
          <div className="rounded-2xl border-l-4 border-l-amber-500 bg-[var(--dash-surface)] px-5 py-4">
            <div className="flex items-start gap-2">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
              <p className="text-sm text-[var(--dash-text)]">
                {getEventType(event.event_type).id === "wedding"
                  ? "Fill in your wedding details to complete your site and paper set."
                  : "Fill in your event details to complete your site and paper set."}
              </p>
            </div>
            <a
              href="#wedding-data-card"
              className="mt-3 inline-block rounded-full bg-[var(--dash-accent)] px-4 py-2 text-xs font-bold text-[var(--dash-accent-contrast)] transition hover:bg-[var(--dash-accent-hover)]"
            >
              {getLocalizedEventType(event.event_type, locale).label} data
            </a>
          </div>
        )}

        <ModuleCard
          id="wedding-data-card"
          icon="💍"
          title={`${getLocalizedEventType(event.event_type, locale).label} data`}
          status={{
            label: `${weddingDataPercent}% complete`,
            tone: weddingDataPercent === 100 ? "on" : "neutral",
          }}
          defaultOpen={weddingDataPercent < 100}
          emphasized
        >
          <p className="mb-3 text-xs text-[var(--dash-text-muted)]">
            Names, date & venue — used across your site and paper set.
          </p>
          <WeddingDataForm eventId={event.id} eventType={event.event_type} defaultValues={weddingDataDefaultValues} locale={locale} />
        </ModuleCard>

        {/* dashboard-audit.md B14: weddingpost.ru's own "quick settings" row
            of three cards -- Start screen / Music / Link preview -- each
            with a preview thumbnail, a Configured/Not set badge, and an
            Edit affordance. "Start screen" is their term for the cover
            (Hero) screen, not a separate splash concept -- Hero is already
            live-editable in the preview to the right, so this card is a
            status shortcut, not a duplicate edit surface. */}
        <ModuleCard
          icon="🖼️"
          title="Start screen"
          previewImageUrl={heroPhotoUrl || undefined}
          status={heroPhotoUrl ? onStatus : notSetStatus}
        >
          <p className="text-xs text-[var(--dash-text-muted)]">
            Your cover photo, names and date are edited directly in the live preview.
          </p>
          <a
            href="#site-editor-preview"
            className="mt-3 inline-block rounded-full bg-[var(--dash-accent)] px-4 py-2 text-xs font-bold text-[var(--dash-accent-contrast)] transition hover:bg-[var(--dash-accent-hover)]"
          >
            Edit in the preview
          </a>
        </ModuleCard>

        <ModuleCard icon="🎵" title="Music" status={siteSettingsDefaultValues.musicUrl ? onStatus : notSetStatus}>
          <SiteSettingsEditForm eventId={event.id} defaultValues={siteSettingsDefaultValues} />
        </ModuleCard>

        <ModuleCard
          icon="🔗"
          title="Link preview"
          previewImageUrl={socialImageUrl || heroPhotoUrl || undefined}
          status={socialImageUrl || heroPhotoUrl ? onStatus : notSetStatus}
        >
          <LinkPreviewCard
            eventId={event.id}
            defaultValues={{ socialImageUrl }}
            fallbackImageUrl={heroPhotoUrl || undefined}
            title={event.title}
            description={getInviteDescription(event.event_date)}
          />
        </ModuleCard>

        <ModuleCard
          id="custom-domain-card"
          icon="🌐"
          title="Custom domain"
          status={
            event.custom_domain_verified_at
              ? { label: "Verified", tone: "on" }
              : event.custom_domain
                ? { label: "Pending", tone: "neutral" }
                : notSetStatus
          }
        >
          <DomainEditForm
            eventId={event.id}
            hasBasicAccess={hasBasicAccess}
            suggestedSubdomain={event.slug}
            appDomain={process.env.NEXT_PUBLIC_APP_DOMAIN ?? "invimbo.com"}
            defaultValues={{
              customDomain: event.custom_domain ?? "",
              verificationToken: event.custom_domain_verification_token,
              verifiedAt: event.custom_domain_verified_at,
            }}
          />
        </ModuleCard>

        <PasswordProtectionCard eventId={event.id} enabled={event.site_password_enabled} />
      </div>

      {/* landing-audit.md dashboard-audit.md A2: one device-framed canvas,
          not an editor column plus a separate read-only iframe "preview" of
          the same content -- SiteInlineEditor already IS the real live site
          (no form, no postMessage bridge), so the fix is framing it like the
          weddingpost.ru canvas (3.4: "рамке планшета/телефона... собственным
          скроллбаром") and deleting the old iframe column outright, not
          keeping both in sync. No URL bar here on purpose -- that's A5's
          domain-placeholder work, not this one. */}
      {/* DashboardShell's own header is now `sticky top-0` (73px tall --
          matches this page's own `calc(100vh-73px)` constant below) -- this
          panel's sticky offset has to clear it, or the header would sit on
          top of the preview's own top edge instead of above it. */}
      <div id="site-editor-preview" className="mt-6 flex scroll-mt-6 flex-col items-center lg:sticky lg:top-[97px] lg:mt-0">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--dash-text-muted)]">
          Site editor — click any text to edit it in place
        </p>
        {/* No max-width here -- SiteInlineEditor's own device frame (phone/
            tablet/desktop) is what caps and centers itself now, via its own
            `deviceMaxWidth`. This wrapper used to hardcode 640px (tablet's
            width, previously the widest option) which silently capped the
            newer, wider desktop preview to the same 640px regardless of the
            toggle -- confirmed live via the frame's actual rendered width
            before this fix. */}
        <div className="mx-auto w-full">
            <SiteInlineEditor
              eventId={event.id}
              hasBasicAccess={hasBasicAccess}
              theme={theme}
              heroVariant={heroVariant}
              heroPhotoUrl={heroPhotoUrl}
              heroEyebrow={heroEyebrow}
              heroStyleOverrides={heroStyleOverrides}
              heroHiddenFields={heroHiddenFields}
              weddingData={{
                eventType: event.event_type,
                name1: weddingDataDefaultValues.name1,
                name2: weddingDataDefaultValues.name2 || undefined,
                eventDate: weddingDataDefaultValues.eventDate,
                venueName: weddingDataDefaultValues.venueName || undefined,
                venueCity: weddingDataDefaultValues.venueCity || undefined,
                venueAddress: weddingDataDefaultValues.venueAddress || undefined,
              }}
              letter={{ enabled: letterEnabled, variant: letterVariant, values: letterDefaultValues }}
              timeline={{ enabled: timelineEnabled, variant: timelineVariant, values: timelineDefaultValues }}
              map={{ enabled: mapEnabled, variant: mapVariant, values: mapDefaultValues }}
              rsvp={{ enabled: rsvpEnabled, values: rsvpDefaultValues }}
              countdown={{ enabled: countdownEnabled, variant: countdownVariant, values: countdownDefaultValues }}
              gift={{
                enabled: giftEnabled,
                variant: giftVariant,
                values: giftDefaultValues,
                preferences: giftPreferences ?? [],
              }}
              dressCode={{ enabled: dressCodeEnabled, variant: dressCodeVariant, values: dressCodeDefaultValues }}
              guestbook={{
                enabled: guestbookEnabled,
                variant: guestbookVariant,
                values: guestbookDefaultValues,
                messages: guestbookMessages,
              }}
              video={{ enabled: videoEnabled, variant: videoVariant, values: videoDefaultValues }}
              banquetNavigator={{
                enabled: banquetNavigatorEnabled,
                values: banquetNavigatorDefaultValues,
                seatingLabel: getEventType(event.event_type).seatingLabel,
              }}
              guestNotes={{ enabled: guestNotesEnabled, values: guestNotesDefaultValues }}
              faq={{ enabled: faqEnabled, values: faqDefaultValues }}
              travel={{ enabled: travelEnabled, values: travelDefaultValues }}
              allSections={allSections}
            />
        </div>
        {/* Was a tiny underlined text link -- easy to miss entirely next to
            the device-frame preview above it, same "make the real action
            obvious" fix as every other CTA this pass (Publish site,
            +Add event/venue/question/color). A host wants to see the whole
            site the way a guest actually will, full-width and full-height,
            not just the capped device-frame preview. */}
        <a
          href={`/e/${event.slug}`}
          target="_blank"
          rel="noreferrer"
          className="dash-btn dash-btn-primary mt-3 flex w-full items-center justify-center gap-2"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Open full preview in a new tab
        </a>
      </div>
    </div>
  );

  return (
    <div
      className={`-mx-4 -my-6 min-h-[calc(100vh-73px)] bg-[var(--dash-bg)] px-4 py-6 text-[var(--dash-text)] sm:-mx-10 sm:-my-10 sm:px-10 sm:py-10 ${
        hasBasicAccess ? "" : "pb-24"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="dash-h1 text-[var(--dash-text)]">Site</h1>
        <div className="flex flex-wrap items-center gap-2">
          <EventTypeSwitcher
            eventId={event.id}
            currentEventType={event.event_type}
            name1={event.subtitle_names?.[0] ?? ""}
            name2={event.subtitle_names?.[1]}
            locale={locale}
          />
          <Link
            href={`/dashboard/${event.id}/canvas`}
            className="rounded-full border border-[var(--dash-border)] px-3.5 py-1.5 text-xs font-medium text-[var(--dash-text-muted)] transition hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
          >
            🎨 Free canvas
          </Link>
        </div>
      </div>

      {/* Direct feedback: checkout redirected back to /plan, which has no
          link on it at all -- a host who'd just paid landed on a page with
          nothing to show for it. success_url (plan/actions.ts) now points
          here instead, where the real link and the domain-claim card
          already live, so "I paid, now what" resolves on arrival.
          Gated on hasBasicAccess (not just the query param) -- the plan
          upgrade itself only happens when Stripe's webhook
          (app/api/stripe/webhook/route.ts) fires and updates plan_id, which
          is a separate, async, server-to-server call that can lag behind
          (or, in local dev with no `stripe listen` forwarding configured,
          never arrive at all) the browser's redirect back here. Showing
          "Payment received" unconditionally off the query param alone told
          a host their link was ready even when the DB write never landed --
          indistinguishable from a real failure from their side. */}
      {checkout === "success" &&
        (hasBasicAccess ? (
          <div className="mt-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5">
            <p className="text-base font-bold text-emerald-900">🎉 Payment received — your link is ready.</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <a
                href={`/e/${event.slug}`}
                target="_blank"
                rel="noreferrer"
                className="dash-btn dash-btn-primary"
              >
                Open your link →
              </a>
              <a href="#custom-domain-card" className="text-sm font-semibold text-emerald-800 underline">
                Or claim a nicer address (yourname.invimbo.com)
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
            <p className="text-base font-bold text-amber-900">⏳ Confirming your payment…</p>
            <p className="mt-1 text-sm text-amber-800">
              Stripe is finishing up — this page will unlock automatically in a few seconds. If it doesn&apos;t,
              refresh, or contact support if your card was charged and this still doesn&apos;t update.
            </p>
          </div>
        ))}

      {/* First-visit-after-onboarding: finished site before the settings/
          modules clutter -- see isFirstVisit's own comment above. Every
          later visit keeps the original order (selling/modules first). */}
      {isFirstVisit ? (
        <>
          {previewGrid}
          {sellingAndModulesBlock}
        </>
      ) : (
        <>
          {sellingAndModulesBlock}
          {previewGrid}
        </>
      )}

      {/* Direct feedback: wanted the pay CTA pinned both top (header's
          PlanBadge, now sticky) AND bottom -- a host scrolled deep into a
          long constructor page shouldn't have to scroll all the way back
          down (or up) to find it. `fixed` rather than `sticky`: this button
          used to live inside the right-hand preview column, but that column
          isn't reliably the page's own scroll container at every
          breakpoint, so `fixed` pins it to the viewport itself regardless.
          Hidden once already on Basic+ (nothing left to sell here).
          "Get your link" -- phrased identically to DashboardShell's new,
          plan-independent "Copy your link" button -- read as payment being
          required for a link at all, when Free publishing was never gated
          on it. "Remove the badge" names the thing Basic actually changes. */}
      {!hasBasicAccess && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] sm:px-10">
          <Link
            href={`/dashboard/${event.id}/plan`}
            className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-full bg-[var(--dash-accent)] px-4 py-2.5 text-sm font-bold text-[var(--dash-accent-contrast)] shadow-[0_6px_16px_rgba(255,107,69,0.35)] transition hover:bg-[var(--dash-accent-hover)]"
          >
            Happy with it? Remove the badge — €{plans.basic.priceEur}
          </Link>
        </div>
      )}
    </div>
  );
}
