import { HeroSection, DEFAULT_HERO_VARIANT } from "./HeroSection";
import type { HeroSectionProps } from "./HeroSection";
import { LetterSection, DEFAULT_LETTER_VARIANT } from "./LetterSection";
import type { LetterSectionProps } from "./LetterSection";
import { TimelineSection, DEFAULT_TIMELINE_VARIANT } from "./TimelineSection";
import type { TimelineSectionProps } from "./TimelineSection";
import { MapSection, DEFAULT_MAP_VARIANT } from "./MapSection";
import type { MapSectionProps } from "./MapSection";
import { RsvpSection } from "./RsvpSection";
import type { RsvpSectionProps, RsvpFormInput } from "./RsvpSection";
import { CountdownSection, DEFAULT_COUNTDOWN_VARIANT } from "./CountdownSection";
import type { CountdownSectionProps } from "./CountdownSection";
import { GiftSection, DEFAULT_GIFT_VARIANT } from "./GiftSection";
import type { GiftSectionProps, GiftPreferenceItem } from "./GiftSection";
import { DressCodeSection, DEFAULT_DRESS_CODE_VARIANT } from "./DressCodeSection";
import type { DressCodeSectionProps } from "./DressCodeSection";
import { GuestbookSection, DEFAULT_GUESTBOOK_VARIANT } from "./GuestbookSection";
import type { GuestbookSectionProps, GuestbookMessageItem } from "./GuestbookSection";
import { VideoSection, DEFAULT_VIDEO_VARIANT } from "./VideoSection";
import type { VideoSectionProps } from "./VideoSection";
import type { BackgroundFill } from "@/lib/backgroundFills";
import { BanquetNavigatorSection, DEFAULT_BANQUET_NAVIGATOR_VARIANT } from "./BanquetNavigatorSection";
import type { BanquetNavigatorSectionProps, BanquetTableLookupResult } from "./BanquetNavigatorSection";
import type { Json } from "@/lib/supabase/database.types";
import type { ThemeCategory } from "@/lib/themes/types";

export const componentRegistry = {
  hero: HeroSection,
  letter: LetterSection,
  timeline: TimelineSection,
  map: MapSection,
  rsvp: RsvpSection,
  countdown: CountdownSection,
  gift: GiftSection,
  dressCode: DressCodeSection,
  guestbook: GuestbookSection,
  video: VideoSection,
  banquetNavigator: BanquetNavigatorSection,
};

export type SectionType = keyof typeof componentRegistry;

// dashboard-audit.md "fresh eyes" finding #3: "letter" used to share the
// label "Invitation" with the site-wide concept of "the invitation" (the
// whole guest-facing site *is* the invitation), so toggling this one module
// off in the Modules panel read as "does this remove the whole site?" --
// SiteInlineEditor's own section header already called this block "Letter"
// (see its sectionLabels map), this just brings the shared, guest-facing
// label (Modules panel row + public nav) in line with that, spelled out as
// "Welcome Letter" so its content (a personal note to guests) is clear on
// its own rather than relying on context.
export const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Home",
  letter: "Welcome Letter",
  timeline: "Schedule",
  map: "Location",
  rsvp: "RSVP",
  countdown: "Countdown",
  gift: "Gifts",
  dressCode: "Dress Code",
  guestbook: "Guestbook",
  video: "Video",
  banquetNavigator: "Find My Table",
};

export interface SectionConfig {
  type: SectionType;
  variant: string;
  order: number;
  enabled: boolean;
  /** dashboard-audit.md B12: one shared background field on the section
   * itself (not duplicated into every section type's own content shape) --
   * weddingpost.ru offers a background picker per block ("Фон главного
   * блока", "Фон блока приглашения", etc.); this is the equivalent, applied
   * uniformly to whichever section it's set on via SiteInlineEditor's
   * existing per-section wrapper. Undefined for every section saved before
   * B12, which renders with no override -- just the theme's own bg, as
   * before. */
  background?: BackgroundFill;
}

const SECTION_TYPES = Object.keys(componentRegistry) as SectionType[];

/** Canonical display order for every section type -- shared by every action
 * that creates a `sections` entry for the first time, instead of each one
 * hardcoding its own `order: N` literal. */
export const SECTION_ORDER: Record<SectionType, number> = {
  hero: 0,
  letter: 1,
  timeline: 2,
  map: 3,
  rsvp: 4,
  countdown: 5,
  gift: 6,
  dressCode: 7,
  guestbook: 8,
  video: 9,
  banquetNavigator: 10,
};

/** Variant a section starts with the first time it's toggled on before ever
 * being configured (see `toggleSection` in actions.ts). RSVP has only ever
 * had one layout, so it's a literal rather than an imported constant. */
export const DEFAULT_VARIANTS: Record<SectionType, string> = {
  hero: DEFAULT_HERO_VARIANT,
  letter: DEFAULT_LETTER_VARIANT,
  timeline: DEFAULT_TIMELINE_VARIANT,
  map: DEFAULT_MAP_VARIANT,
  rsvp: "simple-form",
  countdown: DEFAULT_COUNTDOWN_VARIANT,
  gift: DEFAULT_GIFT_VARIANT,
  dressCode: DEFAULT_DRESS_CODE_VARIANT,
  guestbook: DEFAULT_GUESTBOOK_VARIANT,
  video: DEFAULT_VIDEO_VARIANT,
  banquetNavigator: DEFAULT_BANQUET_NAVIGATOR_VARIANT,
};

/**
 * `site_config.sections` is a Postgres `json` column, so its shape is only
 * a convention, not a guarantee. Malformed entries are dropped here rather
 * than crashing the page; disabled entries are kept (not dropped) so a
 * module's variant/order survive being toggled off -- callers that only want
 * what's actually live on the public site must filter by `.enabled`
 * themselves. Missing/malformed `enabled` defaults to `true` for rows saved
 * before this field existed. Result comes out sorted and ready to render.
 */
export function parseSections(raw: Json): SectionConfig[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .filter((entry): entry is Record<string, Json> => typeof entry === "object" && entry !== null && !Array.isArray(entry))
    .map((entry) => ({
      type: entry.type,
      variant: entry.variant,
      order: entry.order,
      enabled: entry.enabled,
      background: entry.background,
    }))
    .filter(
      (entry) =>
        typeof entry.type === "string" &&
        SECTION_TYPES.includes(entry.type as SectionType) &&
        typeof entry.variant === "string" &&
        typeof entry.order === "number"
    )
    .map(
      (entry): SectionConfig => ({
        type: entry.type as SectionType,
        variant: entry.variant as string,
        order: entry.order as number,
        enabled: typeof entry.enabled === "boolean" ? entry.enabled : true,
        background:
          typeof entry.background === "object" && entry.background !== null && !Array.isArray(entry.background)
            ? (entry.background as unknown as BackgroundFill)
            : undefined,
      })
    )
    .sort((a, b) => a.order - b.order);
}

/**
 * Content a section is seeded with the moment its Modules-panel switch is
 * flipped on for the first time (see `toggleSection` in
 * `app/dashboard/[eventId]/site/actions.ts`) -- without this, "on" silently
 * meant nothing on the public page until the host separately opened that
 * section's own card and made an edit (autosave skips the untouched first
 * render), which is how the RSVP module could show "enabled" in the Modules
 * list, render fine in the dashboard's own canvas preview, and still never
 * appear for guests. Only for section types that make sense with zero
 * owner-authored content -- RSVP/Guestbook collect from guests, Countdown
 * reads the event date from `context`, Gift's items come from the separate
 * `gift_preferences` table, Find My Table is a lookup tool. `letter`,
 * `video`, `timeline` and `map` are deliberately absent: they only mean
 * anything once the host has written a real note, pasted a real video URL,
 * or added real events/venues, so they keep needing that edit first --
 * `sectionWillRender` already gates timeline/map the same way for the same
 * reason.
 */
export const DEFAULT_CONTENT_ON_ENABLE: Partial<Record<SectionType, Record<string, unknown>>> = {
  rsvp: { title: SECTION_LABELS.rsvp, questions: [] },
  countdown: { title: SECTION_LABELS.countdown },
  gift: { title: SECTION_LABELS.gift },
  dressCode: { title: SECTION_LABELS.dressCode, colors: [] },
  guestbook: { title: SECTION_LABELS.guestbook },
  banquetNavigator: { title: SECTION_LABELS.banquetNavigator },
};

/** `site_config.content` is also a `json` column; only its top-level shape (an object keyed by section type) is checked here. */
export function parseContent(raw: Json): Record<string, unknown> {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return {};
  }
  return raw as Record<string, unknown>;
}

/**
 * Per-section extra data that doesn't come from `content[section.type]` —
 * either because it's a bound server action (rsvp), derived from columns
 * outside `content` (countdown), or fetched from a related table (gift).
 * Namespaced by section type so each `renderSection` case only ever touches
 * its own slice.
 */
export interface RenderSectionContext {
  hero?: { themeCategory?: ThemeCategory };
  letter?: { themeCategory?: ThemeCategory };
  rsvp: {
    onSubmit: (input: RsvpFormInput) => Promise<{ ok: true } | { ok: false; message: string }>;
    defaultGuestName?: string;
    maxPartySize?: number;
  };
  countdown: { eventDateTime: string; themeCategory?: ThemeCategory };
  gift: { preferences: GiftPreferenceItem[]; themeCategory?: ThemeCategory };
  dressCode?: { themeCategory?: ThemeCategory };
  guestbook: { messages: GuestbookMessageItem[] };
  banquetNavigator: {
    onLookup: (fullName: string) => Promise<BanquetTableLookupResult>;
    assignedTableName?: string;
  };
}

/**
 * Timeline and Map have no owner-facing enabled toggle (unlike RSVP/Countdown/
 * Gift/DressCode) -- they're meant to be always-on once there's content. But a
 * host can save either tab with just a title and no events/venues yet, which
 * would otherwise permanently show an empty heading with nothing under it on
 * the live public site. Shared by `renderSection` (skips rendering) and the
 * page's nav-link list (skips linking to a section that won't be on the page).
 */
export function sectionWillRender(section: SectionConfig, content: Record<string, unknown>): boolean {
  const data = content[section.type];
  if (!data || typeof data !== "object") {
    return false;
  }
  if (section.type === "timeline") {
    const events = (data as { events?: unknown }).events;
    return Array.isArray(events) && events.length > 0;
  }
  if (section.type === "map") {
    const venues = (data as { venues?: unknown }).venues;
    return Array.isArray(venues) && venues.length > 0;
  }
  return true;
}

/** Sets a value at a dot-path field key against a shallow-copied object --
 * either `"field"` (top-level) or `"arrayField.index.subfield"` (one item of
 * a repeatable list, e.g. `"events.0.title"`). Deliberately a standalone
 * copy of the same two shapes `SiteInlineEditor`'s own field setter handles
 * (not imported from there): that file is a client component built around
 * its own editing state, while this one runs equally on the server for the
 * public site -- keeping them separate avoids pulling client-only concerns
 * into the shared render path. */
function setByPath(obj: Record<string, unknown>, path: string, value: string): Record<string, unknown> {
  const parts = path.split(".");
  if (parts.length === 1) {
    return { ...obj, [parts[0]]: value };
  }
  const [arrayField, indexStr, subfield] = parts;
  const index = Number(indexStr);
  const currentArray = Array.isArray(obj[arrayField]) ? (obj[arrayField] as unknown[]) : [];
  if (!Number.isInteger(index) || index < 0 || index >= currentArray.length) {
    return obj;
  }
  const nextArray = currentArray.slice();
  // Two shapes: "arrayField.index" for an array of primitives (Hero's
  // `names`), "arrayField.index.subfield" for an array of objects (a
  // Timeline event, Map venue, etc.) -- `subfield` is only present in the
  // second.
  nextArray[index] =
    subfield === undefined ? value : { ...(nextArray[index] as Record<string, unknown>), [subfield]: value };
  return { ...obj, [arrayField]: nextArray };
}

/**
 * dashboard-audit.md A3: hiding a block never deletes its saved value (see
 * `hiddenFields` on each section's content, set via the "Editable blocks"
 * panel's eye icon) -- it just withholds that field's value from render, by
 * blanking it right before the data reaches a variant component. Used here
 * for the public site and identically in `SiteInlineEditor` for the
 * dashboard's own live canvas, so a hidden field disappears from both in the
 * same way instead of only being hidden in one place.
 */
export function applyHiddenFields<T extends object>(data: T, hiddenFields: unknown): T {
  if (!Array.isArray(hiddenFields) || hiddenFields.length === 0) {
    return data;
  }
  let result: Record<string, unknown> = data as Record<string, unknown>;
  for (const field of hiddenFields) {
    if (typeof field === "string") {
      result = setByPath(result, field, "");
    }
  }
  return result as T;
}

/**
 * Renders one section from its `sections` config entry + the matching slice
 * of `content`. Data comes from a Postgres `json` column, so its shape is
 * only trusted, not statically known — this is the one place that casts it
 * to each section's real prop type.
 */
export function renderSection(
  section: SectionConfig,
  content: Record<string, unknown>,
  context: RenderSectionContext
) {
  const rawData = content[section.type];
  if (!rawData || typeof rawData !== "object") {
    return null;
  }
  if (!sectionWillRender(section, content)) {
    return null;
  }
  const data = applyHiddenFields(rawData as Record<string, unknown>, (rawData as { hiddenFields?: unknown }).hiddenFields);

  switch (section.type) {
    case "hero": {
      const Component = componentRegistry.hero;
      return (
        <Component
          key={section.type}
          variant={section.variant as HeroSectionProps["variant"]}
          {...(data as Omit<HeroSectionProps, "variant">)}
          themeCategory={context.hero?.themeCategory}
        />
      );
    }
    case "letter": {
      const Component = componentRegistry.letter;
      return (
        <Component
          key={section.type}
          variant={section.variant as LetterSectionProps["variant"]}
          {...(data as Omit<LetterSectionProps, "variant">)}
          themeCategory={context.letter?.themeCategory}
        />
      );
    }
    case "timeline": {
      const Component = componentRegistry.timeline;
      return (
        <Component
          key={section.type}
          variant={section.variant as TimelineSectionProps["variant"]}
          {...(data as Omit<TimelineSectionProps, "variant">)}
        />
      );
    }
    case "map": {
      const Component = componentRegistry.map;
      return (
        <Component
          key={section.type}
          variant={section.variant as MapSectionProps["variant"]}
          {...(data as Omit<MapSectionProps, "variant">)}
        />
      );
    }
    case "rsvp": {
      const Component = componentRegistry.rsvp;
      return (
        <Component
          key={section.type}
          variant={section.variant as RsvpSectionProps["variant"]}
          {...(data as Omit<RsvpSectionProps, "variant" | "onSubmit" | "defaultGuestName" | "maxPartySize">)}
          onSubmit={context.rsvp.onSubmit}
          defaultGuestName={context.rsvp.defaultGuestName}
          maxPartySize={context.rsvp.maxPartySize}
        />
      );
    }
    case "countdown": {
      const Component = componentRegistry.countdown;
      return (
        <Component
          key={section.type}
          variant={section.variant as CountdownSectionProps["variant"]}
          {...(data as Omit<CountdownSectionProps, "variant" | "eventDateTime">)}
          eventDateTime={context.countdown.eventDateTime}
          themeCategory={context.countdown.themeCategory}
        />
      );
    }
    case "gift": {
      const Component = componentRegistry.gift;
      return (
        <Component
          key={section.type}
          variant={section.variant as GiftSectionProps["variant"]}
          {...(data as Omit<GiftSectionProps, "variant" | "preferences">)}
          preferences={context.gift.preferences}
          themeCategory={context.gift.themeCategory}
        />
      );
    }
    case "dressCode": {
      const Component = componentRegistry.dressCode;
      return (
        <Component
          key={section.type}
          variant={section.variant as DressCodeSectionProps["variant"]}
          {...(data as Omit<DressCodeSectionProps, "variant">)}
          themeCategory={context.dressCode?.themeCategory}
        />
      );
    }
    case "guestbook": {
      const Component = componentRegistry.guestbook;
      return (
        <Component
          key={section.type}
          variant={section.variant as GuestbookSectionProps["variant"]}
          {...(data as Omit<GuestbookSectionProps, "variant" | "messages">)}
          messages={context.guestbook.messages}
        />
      );
    }
    case "video": {
      const Component = componentRegistry.video;
      return (
        <Component
          key={section.type}
          variant={section.variant as VideoSectionProps["variant"]}
          {...(data as Omit<VideoSectionProps, "variant">)}
        />
      );
    }
    case "banquetNavigator": {
      const Component = componentRegistry.banquetNavigator;
      return (
        <Component
          key={section.type}
          variant={section.variant as BanquetNavigatorSectionProps["variant"]}
          {...(data as Omit<BanquetNavigatorSectionProps, "variant" | "onLookup" | "assignedTableName">)}
          onLookup={context.banquetNavigator.onLookup}
          assignedTableName={context.banquetNavigator.assignedTableName}
        />
      );
    }
    default:
      return null;
  }
}
