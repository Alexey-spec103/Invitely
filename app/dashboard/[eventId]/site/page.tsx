import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/session";
import { getEventById } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";
import { parseSections, parseContent } from "@/components/sections/registry";
import { getEventType } from "@/lib/eventTypes";
import SectionOrderManager from "./SectionOrderManager";
import FirstVisitTour from "@/components/ui/FirstVisitTour";
import ModuleCard from "@/components/ui/ModuleCard";
import { SectionFocusProvider } from "@/components/site/SectionFocusProvider";
import { toggleSection } from "./actions";
import HeroEditForm from "./HeroEditForm";
import LetterEditForm from "./LetterEditForm";
import TimelineEditForm from "./TimelineEditForm";
import MapEditForm from "./MapEditForm";
import RsvpEditForm from "./RsvpEditForm";
import CountdownEditForm from "./CountdownEditForm";
import GiftWishesEditForm from "./GiftWishesEditForm";
import GiftWishesManager from "./GiftWishesManager";
import DressCodeEditForm from "./DressCodeEditForm";
import GuestbookEditForm from "./GuestbookEditForm";
import VideoEditForm from "./VideoEditForm";
import BanquetNavigatorEditForm from "./BanquetNavigatorEditForm";
import SiteSettingsEditForm from "./SiteSettingsEditForm";
import DomainEditForm from "./DomainEditForm";
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
import { getTheme, DEFAULT_THEME_ID } from "@/lib/themes";

export default async function SitePage({ params }: PageProps<"/dashboard/[eventId]/site">) {
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
  };
  const letterEnabled = letterSection?.enabled ?? false;
  const letterConfigured = typeof content.letter === "object" && content.letter !== null;

  const timelineContent =
    typeof content.timeline === "object" && content.timeline !== null
      ? (content.timeline as Record<string, unknown>)
      : {};
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
    : [];
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
  };
  const timelineEnabled = timelineSection?.enabled ?? false;
  const timelineConfigured = timelineEvents.length > 0;

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
        : [{ name: event.venue_name ?? "", address: event.venue_address ?? "" }],
    mapVariant,
  };
  const mapEnabled = mapSection?.enabled ?? false;
  const mapConfigured = mapVenues.length > 0;

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
  const rsvpConfigured = typeof content.rsvp === "object" && content.rsvp !== null;
  const rsvpDefaultValues = {
    title: typeof rsvpContent.title === "string" ? rsvpContent.title : "",
    description: typeof rsvpContent.description === "string" ? rsvpContent.description : "",
    questions: rsvpQuestions,
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
  const countdownConfigured = typeof content.countdown === "object" && content.countdown !== null;
  const countdownDefaultValues = {
    title: typeof countdownContent.title === "string" ? countdownContent.title : "",
    countdownVariant,
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
  const giftConfigured = typeof content.gift === "object" && content.gift !== null;
  const giftDefaultValues = {
    title: typeof giftContent.title === "string" ? giftContent.title : "",
    description: typeof giftContent.description === "string" ? giftContent.description : "",
    giftVariant,
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
  const dressCodeConfigured = dressCodeColors.length > 0;
  const dressCodeDefaultValues = {
    title: typeof dressCodeContent.title === "string" ? dressCodeContent.title : "",
    description:
      typeof dressCodeContent.description === "string" ? dressCodeContent.description : "",
    colors: dressCodeColors,
    dressCodeVariant,
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
  const guestbookConfigured = typeof content.guestbook === "object" && content.guestbook !== null;
  const guestbookDefaultValues = {
    title: typeof guestbookContent.title === "string" ? guestbookContent.title : "",
    guestbookVariant,
  };

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
  const videoConfigured = typeof videoContent.videoUrl === "string" && videoContent.videoUrl.length > 0;
  const videoDefaultValues = {
    title: typeof videoContent.title === "string" ? videoContent.title : "",
    videoUrl: typeof videoContent.videoUrl === "string" ? videoContent.videoUrl : "",
    videoVariant,
  };

  const banquetNavigatorSection = siteConfig
    ? parseSections(siteConfig.sections).find((section) => section.type === "banquetNavigator")
    : undefined;
  const banquetNavigatorContent =
    typeof content.banquetNavigator === "object" && content.banquetNavigator !== null
      ? (content.banquetNavigator as Record<string, unknown>)
      : {};
  const banquetNavigatorEnabled = banquetNavigatorSection?.enabled ?? false;
  const banquetNavigatorConfigured =
    typeof content.banquetNavigator === "object" && content.banquetNavigator !== null;
  const banquetNavigatorDefaultValues = {
    title:
      typeof banquetNavigatorContent.title === "string" ? banquetNavigatorContent.title : "Find your table",
    description:
      typeof banquetNavigatorContent.description === "string" ? banquetNavigatorContent.description : "",
  };

  const settingsContent =
    typeof content.settings === "object" && content.settings !== null
      ? (content.settings as Record<string, unknown>)
      : {};
  const siteSettingsDefaultValues = {
    musicUrl: typeof settingsContent.musicUrl === "string" ? settingsContent.musicUrl : "",
  };

  const currentSectionTypes = siteConfig
    ? parseSections(siteConfig.sections)
        .filter((section) => section.enabled)
        .map((section) => section.type)
    : [];
  let theme;
  try {
    theme = getTheme(siteConfig?.theme_id ?? DEFAULT_THEME_ID);
  } catch {
    theme = getTheme(DEFAULT_THEME_ID);
  }

  const onStatus = { label: "On", tone: "on" as const };
  const notSetStatus = { label: "Not set", tone: "off" as const };

  // Forces the preview iframe to remount (and so reload its content) whenever
  // the saved data actually changes. site_config has no updated_at trigger to
  // key off of, so this hashes the fetched row itself -- a pure function of
  // this render's data, changing exactly when a module's autosave (which
  // triggers router.refresh()) has actually written something new.
  const previewNonce = JSON.stringify(siteConfig);

  return (
    <div className="max-w-6xl">
      <h1 className="text-xl font-semibold text-gray-900">Site</h1>

      <FirstVisitTour
        tourId="site-editor"
        steps={[
          {
            title: "👋 Welcome to your site editor",
            body: "Everything here saves itself as you type — there's no Save button to remember.",
          },
          {
            title: "🎨 Try a different layout",
            body: "Open the 💌 The essentials card and click through any of the 17 layouts — each one is a live preview using your own theme.",
          },
          {
            title: "📷 Add your photos",
            body: "Drag a photo straight into any photo field. We'll resize it automatically.",
          },
          {
            title: "🧩 Turn modules on or off",
            body: "Countdown, RSVP, gift wishes, dress code and more each have their own on/off switch inside their card.",
          },
        ]}
      />

      <SectionOrderManager eventId={event.id} sectionTypes={currentSectionTypes} />

      <SectionFocusProvider>
      <div className="mt-6 lg:grid lg:grid-cols-[1fr_300px] lg:items-start lg:gap-6">
      <div className="grid gap-2 sm:grid-cols-2">
        <ModuleCard icon="💌" title="The essentials" sectionType="hero">
          <HeroEditForm
            eventId={event.id}
            theme={theme}
            names={event.subtitle_names ?? []}
            eventDate={event.event_date}
            defaultValues={{
              heroVariant,
              photoUrl: heroPhotoUrl,
            }}
          />
        </ModuleCard>

        <ModuleCard
          icon="✉️"
          title="Letter"
          sectionType="letter"
          enabled={letterEnabled}
          configured={letterConfigured}
          onToggle={toggleSection.bind(null, event.id, "letter")}
        >
          <LetterEditForm eventId={event.id} defaultValues={letterDefaultValues} />
        </ModuleCard>

        <ModuleCard
          icon="🕰️"
          title="Timeline"
          sectionType="timeline"
          enabled={timelineEnabled}
          configured={timelineConfigured}
          onToggle={toggleSection.bind(null, event.id, "timeline")}
        >
          <TimelineEditForm eventId={event.id} defaultValues={timelineDefaultValues} />
        </ModuleCard>

        <ModuleCard
          icon="📍"
          title="Map"
          sectionType="map"
          enabled={mapEnabled}
          configured={mapConfigured}
          onToggle={toggleSection.bind(null, event.id, "map")}
        >
          <MapEditForm eventId={event.id} defaultValues={mapDefaultValues} />
        </ModuleCard>

        <ModuleCard
          icon="✅"
          title="RSVP"
          sectionType="rsvp"
          enabled={rsvpEnabled}
          configured={rsvpConfigured}
          onToggle={toggleSection.bind(null, event.id, "rsvp")}
        >
          <RsvpEditForm eventId={event.id} defaultValues={rsvpDefaultValues} />
        </ModuleCard>

        <ModuleCard
          icon="⏳"
          title="Countdown"
          sectionType="countdown"
          enabled={countdownEnabled}
          configured={countdownConfigured}
          onToggle={toggleSection.bind(null, event.id, "countdown")}
        >
          <CountdownEditForm eventId={event.id} defaultValues={countdownDefaultValues} />
        </ModuleCard>

        <ModuleCard
          icon="🎁"
          title="Gift wishes"
          sectionType="gift"
          enabled={giftEnabled}
          configured={giftConfigured}
          onToggle={toggleSection.bind(null, event.id, "gift")}
        >
          <GiftWishesEditForm eventId={event.id} defaultValues={giftDefaultValues} />
          <GiftWishesManager eventId={event.id} preferences={giftPreferences ?? []} />
        </ModuleCard>

        <ModuleCard
          icon="👔"
          title="Dress code"
          sectionType="dressCode"
          enabled={dressCodeEnabled}
          configured={dressCodeConfigured}
          onToggle={toggleSection.bind(null, event.id, "dressCode")}
        >
          <DressCodeEditForm eventId={event.id} defaultValues={dressCodeDefaultValues} />
        </ModuleCard>

        <ModuleCard
          icon="📖"
          title="Guestbook"
          sectionType="guestbook"
          enabled={guestbookEnabled}
          configured={guestbookConfigured}
          onToggle={toggleSection.bind(null, event.id, "guestbook")}
        >
          <GuestbookEditForm eventId={event.id} defaultValues={guestbookDefaultValues} />
        </ModuleCard>

        <ModuleCard
          icon="🎬"
          title="Video"
          sectionType="video"
          enabled={videoEnabled}
          configured={videoConfigured}
          onToggle={toggleSection.bind(null, event.id, "video")}
        >
          <VideoEditForm eventId={event.id} defaultValues={videoDefaultValues} />
        </ModuleCard>

        <ModuleCard
          icon="🍽️"
          title={`${getEventType(event.event_type).seatingLabel} navigator`}
          sectionType="banquetNavigator"
          enabled={banquetNavigatorEnabled}
          configured={banquetNavigatorConfigured}
          onToggle={toggleSection.bind(null, event.id, "banquetNavigator")}
        >
          <BanquetNavigatorEditForm eventId={event.id} defaultValues={banquetNavigatorDefaultValues} />
        </ModuleCard>

        <ModuleCard icon="🎵" title="Music" status={siteSettingsDefaultValues.musicUrl ? onStatus : notSetStatus}>
          <SiteSettingsEditForm eventId={event.id} defaultValues={siteSettingsDefaultValues} />
        </ModuleCard>

        <ModuleCard
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
            defaultValues={{
              customDomain: event.custom_domain ?? "",
              verificationToken: event.custom_domain_verification_token,
              verifiedAt: event.custom_domain_verified_at,
            }}
          />
        </ModuleCard>
      </div>

      <div className="mt-6 lg:sticky lg:top-6 lg:mt-0">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Live preview</p>
        <div
          className="mx-auto w-full max-w-[280px] overflow-hidden rounded-[2rem] border-[6px] border-gray-900 bg-white shadow-lg"
          style={{ aspectRatio: "9 / 19" }}
        >
          <iframe
            key={previewNonce}
            src={`/e/${event.slug}?preview=1`}
            className="h-full w-full"
            title="Live site preview"
          />
        </div>
        <a
          href={`/e/${event.slug}`}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block text-center text-xs text-rose-700 underline underline-offset-2"
        >
          Open full preview in a new tab
        </a>
      </div>
      </div>
      </SectionFocusProvider>
    </div>
  );
}
