"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Undo2, Redo2, Monitor, Smartphone, Tablet } from "lucide-react";
import ThemeProvider from "@/components/theme/ThemeProvider";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { HeroSection } from "@/components/sections/HeroSection";
import type { HeroVariant } from "@/components/sections/HeroSection";
import { getEventType } from "@/lib/eventTypes";
import { LetterSection } from "@/components/sections/LetterSection";
import type { LetterVariant } from "@/components/sections/LetterSection";
import { TimelineSection } from "@/components/sections/TimelineSection";
import type { TimelineVariant, TimelineEvent } from "@/components/sections/TimelineSection";
import { MapSection } from "@/components/sections/MapSection";
import type { MapVariant, MapVenue } from "@/components/sections/MapSection";
import { RsvpSection } from "@/components/sections/RsvpSection";
import type { RsvpQuestion } from "@/components/sections/RsvpSection";
import { applyHiddenFields } from "@/components/sections/registry";
import type { SectionConfig, SectionType } from "@/components/sections/registry";
import type { BackgroundFill } from "@/lib/backgroundFills";
import SectionBackground from "@/components/background/SectionBackground";
import SectionBackgroundButton from "@/components/background/SectionBackgroundButton";
import { CountdownSection } from "@/components/sections/CountdownSection";
import type { CountdownVariant } from "@/components/sections/CountdownSection";
import { GiftSection } from "@/components/sections/GiftSection";
import type { GiftVariant } from "@/components/sections/GiftSection";
import GiftWishesManager from "./GiftWishesManager";
import { DressCodeSection } from "@/components/sections/DressCodeSection";
import type { DressCodeVariant, DressCodeColor } from "@/components/sections/DressCodeSection";
import { GuestbookSection } from "@/components/sections/GuestbookSection";
import type { GuestbookVariant, GuestbookMessageItem } from "@/components/sections/GuestbookSection";
import { VideoSection } from "@/components/sections/VideoSection";
import type { VideoVariant } from "@/components/sections/VideoSection";
import { BanquetNavigatorSection } from "@/components/sections/BanquetNavigatorSection";
import type { Tables } from "@/lib/supabase/database.types";
import PhotoDropzone from "@/components/ui/PhotoDropzone";
import {
  EditableFieldProvider,
  type EditableFieldContextValue,
  type TextStyleOverride,
} from "@/components/site-editor/EditableFieldContext";
import InlineFieldToolbar from "@/components/site-editor/InlineFieldToolbar";
import { useAutosave } from "@/lib/useAutosave";
import type { AutosaveState } from "@/lib/useAutosave";
import AutosaveStatus from "@/components/ui/AutosaveStatus";
import {
  updateHeroSection,
  updateLetterSection,
  updateTimelineSection,
  updateMapSection,
  updateRsvpSection,
  updateCountdownSection,
  updateGiftWishesSection,
  updateDressCodeSection,
  updateGuestbookSection,
  updateVideoSection,
  updateBanquetNavigatorSection,
  updateSectionBackground,
} from "./actions";
import { updateWeddingData } from "../actions";
import type { Theme } from "@/lib/themes";

type StyleOverrides = Record<string, TextStyleOverride>;

interface LetterDraft {
  title: string;
  body: string;
  quote: string;
  note: string;
  rsvpDeadline: string;
  closingLine: string;
  styleOverrides?: StyleOverrides;
  hiddenFields?: string[];
}

interface TimelineDraft {
  title: string;
  events: TimelineEvent[];
  styleOverrides?: StyleOverrides;
  hiddenFields?: string[];
}

interface MapDraft {
  title: string;
  venues: MapVenue[];
  styleOverrides?: StyleOverrides;
  hiddenFields?: string[];
}

/** `options` stays the same comma-joined string the old `RsvpEditForm` used
 * (not `string[]`) -- it's what a plain text input can hold; converted to a
 * real array only where `updateRsvpSection`/`RsvpSection` need it. */
interface RsvpQuestionDraft {
  id: string;
  label: string;
  type: "text" | "choice";
  options: string;
}

interface RsvpDraft {
  title: string;
  description: string;
  questions: RsvpQuestionDraft[];
  styleOverrides?: StyleOverrides;
  hiddenFields?: string[];
}

interface CountdownDraft {
  title: string;
  styleOverrides?: StyleOverrides;
  hiddenFields?: string[];
}

interface GiftDraft {
  title: string;
  description: string;
  styleOverrides?: StyleOverrides;
  hiddenFields?: string[];
}

interface DressCodeDraft {
  title: string;
  description: string;
  colors: DressCodeColor[];
  styleOverrides?: StyleOverrides;
  hiddenFields?: string[];
}

interface GuestbookDraft {
  title: string;
  styleOverrides?: StyleOverrides;
  hiddenFields?: string[];
}

interface VideoDraft {
  title: string;
  videoUrl: string;
  styleOverrides?: StyleOverrides;
  hiddenFields?: string[];
}

interface BanquetNavigatorDraft {
  title: string;
  description: string;
  styleOverrides?: StyleOverrides;
  hiddenFields?: string[];
}

interface WeddingDataDraft {
  eventType: string;
  name1: string;
  name2?: string;
  eventDate: string;
  venueName?: string;
  venueCity?: string;
  venueAddress?: string;
}

type SectionKey =
  | "letter"
  | "timeline"
  | "map"
  | "rsvp"
  | "countdown"
  | "gift"
  | "dressCode"
  | "guestbook"
  | "video"
  | "banquetNavigator";

interface SiteInlineEditorProps {
  eventId: string;
  theme: Theme;
  heroVariant: HeroVariant;
  heroPhotoUrl: string;
  heroStyleOverrides?: StyleOverrides;
  heroHiddenFields?: string[];
  weddingData: WeddingDataDraft;
  letter: { enabled: boolean; variant: LetterVariant; values: LetterDraft };
  timeline: { enabled: boolean; variant: TimelineVariant; values: TimelineDraft };
  map: { enabled: boolean; variant: MapVariant; values: MapDraft };
  rsvp: { enabled: boolean; values: RsvpDraft };
  countdown: { enabled: boolean; variant: CountdownVariant; values: CountdownDraft };
  gift: {
    enabled: boolean;
    variant: GiftVariant;
    values: GiftDraft;
    preferences: Tables<"gift_preferences">[];
  };
  dressCode: { enabled: boolean; variant: DressCodeVariant; values: DressCodeDraft };
  guestbook: {
    enabled: boolean;
    variant: GuestbookVariant;
    values: GuestbookDraft;
    messages: GuestbookMessageItem[];
  };
  video: { enabled: boolean; variant: VideoVariant; values: VideoDraft };
  banquetNavigator: { enabled: boolean; values: BanquetNavigatorDraft; seatingLabel: string };
  /** dashboard-audit.md B12: the raw parsed sections array, purely so this
   * component can look up each section's own `.background` (see
   * registry.tsx) -- simpler than threading a `background` field through
   * every one of the props above individually. */
  allSections: SectionConfig[];
}

/** Sets a value at a dot-path field key against a flat draft object -- the
 * two shapes every field key in this editor actually takes: a single
 * top-level key ("title"), or "<arrayField>.<index>.<subfield>" for a
 * repeatable item ("events.0.title"). Not a fully generic deep-path setter
 * on purpose -- these are the only two shapes any section here produces. */
function setFieldValue<T extends Record<string, unknown>>(obj: T, field: string, value: string): T {
  const parts = field.split(".");
  if (parts.length === 1) {
    return { ...obj, [parts[0]]: value };
  }
  const [arrayField, indexStr, subfield] = parts;
  const index = Number(indexStr);
  const currentArray = Array.isArray(obj[arrayField]) ? (obj[arrayField] as Record<string, unknown>[]) : [];
  const nextArray = currentArray.slice();
  nextArray[index] = { ...nextArray[index], [subfield]: value };
  return { ...obj, [arrayField]: nextArray };
}

/** `RsvpQuestionDraft.options` is a plain comma-joined string (what a text
 * input can hold, and what `updateRsvpSection` already expects on save) --
 * converted to the real `string[]` `RsvpSection`/`SimpleForm` render from
 * only here, at the render boundary, the same way `updateRsvpSection`
 * itself converts it server-side on save. */
function rsvpQuestionsForRender(questions: RsvpQuestionDraft[]): RsvpQuestion[] {
  return questions.map((question) => ({
    id: question.id,
    label: question.label,
    type: question.type,
    options:
      question.type === "choice"
        ? question.options
            .split(",")
            .map((option) => option.trim())
            .filter(Boolean)
        : undefined,
  }));
}

/** Gift registry rows come back from Supabase snake_case (matching the
 * `gift_preferences` table) -- `GiftSection` expects the camelCase shape
 * `GiftPreferenceItem` uses everywhere else (mirrors the identical mapping
 * `app/e/[slug]/page.tsx` already does for the public site). `GiftWishesManager`,
 * which edits these rows directly against the table, gets the raw rows
 * unchanged -- this conversion only exists for the read-only live preview. */
function giftPreferencesForRender(rows: Tables<"gift_preferences">[]) {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    type: row.type,
    url: row.url,
    imageUrl: row.image_url,
    description: row.description,
  }));
}

function setStyleOverride<T extends { styleOverrides?: StyleOverrides }>(
  obj: T,
  field: string,
  patch: TextStyleOverride | null
): T {
  const overrides = { ...(obj.styleOverrides ?? {}) };
  if (patch === null) {
    delete overrides[field];
  } else {
    overrides[field] = { ...overrides[field], ...patch };
  }
  return { ...obj, styleOverrides: overrides };
}

/** Toggles one field key in `hiddenFields` -- dashboard-audit.md A3's eye
 * icon. Never touches the field's actual value (that's `applyHiddenFields`,
 * used only at render time, in `registry.tsx`), so un-hiding always restores
 * exactly what was there before. */
function setHidden<T extends { hiddenFields?: string[] }>(obj: T, field: string, hidden: boolean): T {
  const current = obj.hiddenFields ?? [];
  const next = hidden ? [...current, field] : current.filter((existing) => existing !== field);
  return { ...obj, hiddenFields: next };
}

/** dashboard-audit.md A3: one row in the "Editable blocks" tree -- built
 * directly from each section's own draft state (not read back from the DOM),
 * so it's always in sync with what's about to save. `label` is the block's
 * own current text (weddingpost.ru's own precedent: "не «Layer 12», а сам
 * текст блока"), not a generated name. */
interface BlockRowData {
  key: string;
  type: "text" | "image" | "auto" | "group";
  label: string;
  hidden: boolean;
  onSelect: () => void;
  onToggleHidden?: () => void;
  onDelete?: () => void;
}

/** Builds everything about a row except `onSelect` -- deliberately takes no
 * ref (not even wrapped in a thunk): the react-hooks/refs lint rule flags a
 * ref reached through *any* function call during render, no matter how many
 * closures it's nested inside. Callers add `onSelect` themselves as a plain
 * object-literal property (never passed into a call), the same shape the
 * "group" rows below already use safely. */
function makeRow(opts: {
  field: string;
  label: string;
  type: "text" | "image" | "auto";
  hiddenFields: string[] | undefined;
  commitHidden: (field: string, hidden: boolean) => void;
}): Omit<BlockRowData, "onSelect"> {
  const hidden = (opts.hiddenFields ?? []).includes(opts.field);
  return {
    key: opts.field,
    type: opts.type,
    label: opts.label.trim() || "(empty)",
    hidden,
    onToggleHidden: () => opts.commitHidden(opts.field, !hidden),
  };
}

/** Same select-then-scroll behavior every row's `onSelect` needs, factored
 * out as values only (a field-setter function and a plain string field key
 * -- never a ref), so the ref access itself stays written inline at each
 * call site rather than flowing through this helper. */
function scrollToField(container: HTMLDivElement | null, field: string) {
  requestAnimationFrame(() => {
    container?.querySelector<HTMLElement>(`[data-field="${CSS.escape(field)}"]`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  });
}

/** Draft + selection + a simple linear undo/redo stack for one section --
 * shared shape across Letter/Timeline/Map (Hero is handled separately below
 * since its text fields route to a different table/action than its style
 * overrides do). Strictly better than weddingpost.ru's own plain-browser
 * contentEditable undo (confirmed live, this session, to be per-keystroke
 * and app-unaware) -- this is a real app-level snapshot stack, the same
 * pattern already proven in CanvasEditor's history/historyIndex. */
function useEditableSection<T extends { styleOverrides?: StyleOverrides; hiddenFields?: string[] }>(
  initial: T,
  save: (value: T) => Promise<void>
) {
  const [draft, setDraft] = useState<T>(initial);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const historyRef = useRef<T[]>([initial]);
  const historyIndexRef = useRef(0);
  // dashboard-audit.md B10: mirrors historyIndexRef/historyRef.length as
  // state so the visible undo/redo buttons can read canUndo/canRedo during
  // render -- reading a ref's `.current` during render is disallowed
  // (react-hooks/refs), so the refs stay the source of truth for the actual
  // stack (mutated only inside callbacks/handlers) and these two booleans
  // are just kept in sync alongside every push/undo/redo.
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const pushHistory = useCallback((next: T) => {
    const truncated = historyRef.current.slice(0, historyIndexRef.current + 1);
    truncated.push(next);
    historyRef.current = truncated;
    historyIndexRef.current = truncated.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  // dashboard-audit.md B10: `pushHistory` has a side effect (mutating the
  // history refs, plus setCanUndo/setCanRedo) -- calling it from inside a
  // setState *updater* function (the previous `setDraft(prev => {...
  // pushHistory(next); return next})` shape) gets that updater silently
  // double-invoked by React 18 StrictMode's dev-mode impurity check, which
  // double-pushed every single commit onto the stack (confirmed live: one
  // edit needed two clicks of the new visible Undo button to actually
  // revert). Reading `draft` from the closure and calling `pushHistory` as a
  // plain statement in the handler body -- not inside an updater -- runs
  // exactly once per commit regardless of StrictMode.
  const commitText = useCallback(
    (field: string, value: string) => {
      const next = setFieldValue(draft, field, value);
      pushHistory(next);
      setDraft(next);
    },
    [draft, pushHistory]
  );

  const commitStyle = useCallback(
    (field: string, patch: TextStyleOverride | null) => {
      const next = setStyleOverride(draft, field, patch);
      pushHistory(next);
      setDraft(next);
    },
    [draft, pushHistory]
  );

  const commitHidden = useCallback(
    (field: string, hidden: boolean) => {
      const next = setHidden(draft, field, hidden);
      pushHistory(next);
      setDraft(next);
    },
    [draft, pushHistory]
  );

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    setDraft(historyRef.current[historyIndexRef.current]);
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(true);
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    setDraft(historyRef.current[historyIndexRef.current]);
    setCanUndo(true);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  const { state, error } = useAutosave(draft, save);

  return {
    draft,
    setDraft,
    selectedField,
    setSelectedField,
    commitText,
    commitStyle,
    commitHidden,
    undo,
    redo,
    canUndo,
    canRedo,
    state,
    error,
  };
}

const sectionLabels: Record<SectionKey, string> = {
  letter: "Letter",
  timeline: "Timeline",
  map: "Map",
  rsvp: "RSVP",
  countdown: "Countdown",
  gift: "Gift wishes",
  dressCode: "Dress code",
  guestbook: "Guestbook",
  video: "Video",
  banquetNavigator: "Seating navigator",
};

/** The dashboard's own owner never actually RSVPs from inside their own
 * editor -- clicking "Send RSVP" here must not write a real guest row.
 * Unlike the old iframe preview (which reused the real bound `submitRsvp`
 * action even at `?preview=1`, a pre-existing quirk left alone rather than
 * fixed here), this editor renders the interactive form for layout/text
 * purposes only. Rejecting (rather than a blocking `alert`) surfaces the
 * message through `SimpleForm`'s own existing error paragraph for free. */
async function previewOnlySubmit(): Promise<{ ok: false; message: string }> {
  return { ok: false, message: "This is a preview — guests submit RSVPs from your live site, not from here." };
}

/** Same reasoning as `previewOnlySubmit` above -- the dashboard's live
 * render of the seating lookup form must not run a real guest-table search
 * against this event's actual seating data. */
async function previewOnlyLookup(): Promise<never> {
  throw new Error("This is a preview — guests look up their table from your live site, not from here.");
}

export default function SiteInlineEditor({
  eventId,
  theme,
  heroVariant,
  heroPhotoUrl,
  heroStyleOverrides,
  heroHiddenFields,
  weddingData,
  letter,
  timeline,
  map,
  rsvp,
  countdown,
  gift,
  dressCode,
  guestbook,
  video,
  banquetNavigator,
  allSections,
}: SiteInlineEditorProps) {
  const router = useRouter();
  // dashboard-audit.md B12: one handler for every section's background
  // button -- looks up the section's current fill from the raw parsed
  // array (see the prop's own comment) and saves a new one through the one
  // shared action, rather than each section wiring this up separately.
  const getSectionBackground = useCallback(
    (type: SectionType) => allSections.find((section) => section.type === type)?.background,
    [allSections]
  );
  const handleBackgroundChange = useCallback(
    (type: SectionType, fill: BackgroundFill | undefined) => {
      void (async () => {
        try {
          await updateSectionBackground(eventId, type, fill);
          router.refresh();
        } catch {
          // Best-effort, same as the rest of this editor's autosave-style
          // writes -- no dedicated error UI for a background tweak.
        }
      })();
    },
    [eventId, router]
  );
  // dashboard-audit.md B10: weddingpost.ru's own device switcher just
  // reflows the same live page at a different width, not a second mockup --
  // matched here via the device frame's own max-width below. Desktop added
  // alongside phone/tablet (phone/tablet behavior unchanged) so a host can
  // see the real, full-width desktop layout instead of only narrow mockups
  // -- first in the list and the default view, since that's the most
  // complete look at the site. The preview column itself is `1fr` (see
  // site/page.tsx's grid), so this width is a cap, not a promise -- it
  // still gracefully shrinks on a narrower dashboard viewport, same as
  // tablet already does.
  const [device, setDevice] = useState<"desktop" | "phone" | "tablet">("desktop");
  const deviceMaxWidth = device === "desktop" ? 1280 : device === "tablet" ? 640 : 420;
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const rsvpRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<HTMLDivElement>(null);
  const giftRef = useRef<HTMLDivElement>(null);
  const dressCodeRef = useRef<HTMLDivElement>(null);
  const guestbookRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const banquetNavigatorRef = useRef<HTMLDivElement>(null);
  const sectionRefs = {
    hero: heroRef,
    letter: letterRef,
    timeline: timelineRef,
    map: mapRef,
    rsvp: rsvpRef,
    countdown: countdownRef,
    gift: giftRef,
    dressCode: dressCodeRef,
    guestbook: guestbookRef,
    video: videoRef,
    banquetNavigator: banquetNavigatorRef,
  };

  // --- Hero: names/date live on the `events` row (Wedding Data), photo +
  // style overrides live on site_config.content.hero -- two different
  // drafts, two different save actions, so it can't use useEditableSection. ---
  const [weddingDataDraft, setWeddingDataDraft] = useState<WeddingDataDraft>(weddingData);
  const [heroPhoto, setHeroPhoto] = useState(heroPhotoUrl);
  const [heroOverrides, setHeroOverrides] = useState<StyleOverrides | undefined>(heroStyleOverrides);
  const [heroHidden, setHeroHidden] = useState<string[]>(heroHiddenFields ?? []);
  const [heroSelectedField, setHeroSelectedField] = useState<string | null>(null);

  const { state: weddingDataState, error: weddingDataError } = useAutosave(weddingDataDraft, async (value) => {
    const result = await updateWeddingData({ eventId, ...value });
    if (!result.ok) throw new Error(result.message);
    router.refresh();
  });
  const { state: heroState, error: heroError } = useAutosave(
    { photoUrl: heroPhoto, styleOverrides: heroOverrides, hiddenFields: heroHidden },
    async (value) => {
      const result = await updateHeroSection({
        eventId,
        heroVariant,
        photoUrl: value.photoUrl,
        styleOverrides: value.styleOverrides,
        hiddenFields: value.hiddenFields,
      });
      if (!result.ok) throw new Error(result.message);
      router.refresh();
    }
  );

  const heroCommitText = useCallback((field: string, value: string) => {
    setWeddingDataDraft((prev) => {
      if (field === "names.0") return { ...prev, name1: value };
      if (field === "names.1") return { ...prev, name2: value };
      return prev;
    });
  }, []);

  const heroCommitStyle = useCallback((field: string, patch: TextStyleOverride | null) => {
    setHeroOverrides((prev) => {
      const overrides = { ...(prev ?? {}) };
      if (patch === null) delete overrides[field];
      else overrides[field] = { ...overrides[field], ...patch };
      return overrides;
    });
  }, []);

  const heroCommitHidden = useCallback((field: string, hidden: boolean) => {
    setHeroHidden((prev) => (hidden ? [...prev, field] : prev.filter((existing) => existing !== field)));
  }, []);

  const heroContext = useMemo<EditableFieldContextValue>(
    () => ({
      editable: true,
      selectedField: heroSelectedField,
      selectField: setHeroSelectedField,
      commitText: heroCommitText,
      commitStyle: heroCommitStyle,
    }),
    [heroSelectedField, heroCommitText, heroCommitStyle]
  );

  // --- Letter / Timeline / Map: single draft object each, generic hook. ---
  const letterField = useEditableSection<LetterDraft>(letter.values, async (value) => {
    const result = await updateLetterSection({ eventId, letterVariant: letter.variant, ...value });
    if (!result.ok) throw new Error(result.message);
    router.refresh();
  });
  const timelineField = useEditableSection<TimelineDraft>(timeline.values, async (value) => {
    const result = await updateTimelineSection({
      eventId,
      timelineVariant: timeline.variant,
      ...value,
      events: value.events.map((event) => ({ ...event, description: event.description ?? "" })),
    });
    if (!result.ok) throw new Error(result.message);
    router.refresh();
  });
  const mapField = useEditableSection<MapDraft>(map.values, async (value) => {
    const result = await updateMapSection({ eventId, mapVariant: map.variant, ...value });
    if (!result.ok) throw new Error(result.message);
    router.refresh();
  });
  const rsvpField = useEditableSection<RsvpDraft>(rsvp.values, async (value) => {
    const result = await updateRsvpSection({ eventId, ...value });
    if (!result.ok) throw new Error(result.message);
    router.refresh();
  });
  const countdownField = useEditableSection<CountdownDraft>(countdown.values, async (value) => {
    const result = await updateCountdownSection({ eventId, countdownVariant: countdown.variant, ...value });
    if (!result.ok) throw new Error(result.message);
    router.refresh();
  });
  const giftField = useEditableSection<GiftDraft>(gift.values, async (value) => {
    const result = await updateGiftWishesSection({ eventId, giftVariant: gift.variant, ...value });
    if (!result.ok) throw new Error(result.message);
    router.refresh();
  });
  const dressCodeField = useEditableSection<DressCodeDraft>(dressCode.values, async (value) => {
    const result = await updateDressCodeSection({ eventId, dressCodeVariant: dressCode.variant, ...value });
    if (!result.ok) throw new Error(result.message);
    router.refresh();
  });
  const guestbookField = useEditableSection<GuestbookDraft>(guestbook.values, async (value) => {
    const result = await updateGuestbookSection({ eventId, guestbookVariant: guestbook.variant, ...value });
    if (!result.ok) throw new Error(result.message);
    router.refresh();
  });
  const videoField = useEditableSection<VideoDraft>(video.values, async (value) => {
    const result = await updateVideoSection({ eventId, videoVariant: video.variant, ...value });
    if (!result.ok) throw new Error(result.message);
    router.refresh();
  });
  const banquetNavigatorField = useEditableSection<BanquetNavigatorDraft>(banquetNavigator.values, async (value) => {
    const result = await updateBanquetNavigatorSection({
      eventId,
      banquetNavigatorVariant: "simple-lookup",
      ...value,
    });
    if (!result.ok) throw new Error(result.message);
    router.refresh();
  });

  const letterContext = useMemo<EditableFieldContextValue>(
    () => ({
      editable: true,
      selectedField: letterField.selectedField,
      selectField: letterField.setSelectedField,
      commitText: letterField.commitText,
      commitStyle: letterField.commitStyle,
    }),
    [letterField.selectedField, letterField.setSelectedField, letterField.commitText, letterField.commitStyle]
  );
  const timelineContext = useMemo<EditableFieldContextValue>(
    () => ({
      editable: true,
      selectedField: timelineField.selectedField,
      selectField: timelineField.setSelectedField,
      commitText: timelineField.commitText,
      commitStyle: timelineField.commitStyle,
    }),
    [timelineField.selectedField, timelineField.setSelectedField, timelineField.commitText, timelineField.commitStyle]
  );
  const mapContext = useMemo<EditableFieldContextValue>(
    () => ({
      editable: true,
      selectedField: mapField.selectedField,
      selectField: mapField.setSelectedField,
      commitText: mapField.commitText,
      commitStyle: mapField.commitStyle,
    }),
    [mapField.selectedField, mapField.setSelectedField, mapField.commitText, mapField.commitStyle]
  );
  const rsvpContext = useMemo<EditableFieldContextValue>(
    () => ({
      editable: true,
      selectedField: rsvpField.selectedField,
      selectField: rsvpField.setSelectedField,
      commitText: rsvpField.commitText,
      commitStyle: rsvpField.commitStyle,
    }),
    [rsvpField.selectedField, rsvpField.setSelectedField, rsvpField.commitText, rsvpField.commitStyle]
  );
  const countdownContext = useMemo<EditableFieldContextValue>(
    () => ({
      editable: true,
      selectedField: countdownField.selectedField,
      selectField: countdownField.setSelectedField,
      commitText: countdownField.commitText,
      commitStyle: countdownField.commitStyle,
    }),
    [countdownField.selectedField, countdownField.setSelectedField, countdownField.commitText, countdownField.commitStyle]
  );
  const giftContext = useMemo<EditableFieldContextValue>(
    () => ({
      editable: true,
      selectedField: giftField.selectedField,
      selectField: giftField.setSelectedField,
      commitText: giftField.commitText,
      commitStyle: giftField.commitStyle,
    }),
    [giftField.selectedField, giftField.setSelectedField, giftField.commitText, giftField.commitStyle]
  );
  const dressCodeContext = useMemo<EditableFieldContextValue>(
    () => ({
      editable: true,
      selectedField: dressCodeField.selectedField,
      selectField: dressCodeField.setSelectedField,
      commitText: dressCodeField.commitText,
      commitStyle: dressCodeField.commitStyle,
    }),
    [dressCodeField.selectedField, dressCodeField.setSelectedField, dressCodeField.commitText, dressCodeField.commitStyle]
  );
  const guestbookContext = useMemo<EditableFieldContextValue>(
    () => ({
      editable: true,
      selectedField: guestbookField.selectedField,
      selectField: guestbookField.setSelectedField,
      commitText: guestbookField.commitText,
      commitStyle: guestbookField.commitStyle,
    }),
    [guestbookField.selectedField, guestbookField.setSelectedField, guestbookField.commitText, guestbookField.commitStyle]
  );
  const videoContext = useMemo<EditableFieldContextValue>(
    () => ({
      editable: true,
      selectedField: videoField.selectedField,
      selectField: videoField.setSelectedField,
      commitText: videoField.commitText,
      commitStyle: videoField.commitStyle,
    }),
    [videoField.selectedField, videoField.setSelectedField, videoField.commitText, videoField.commitStyle]
  );
  const banquetNavigatorContext = useMemo<EditableFieldContextValue>(
    () => ({
      editable: true,
      selectedField: banquetNavigatorField.selectedField,
      selectField: banquetNavigatorField.setSelectedField,
      commitText: banquetNavigatorField.commitText,
      commitStyle: banquetNavigatorField.commitStyle,
    }),
    [
      banquetNavigatorField.selectedField,
      banquetNavigatorField.setSelectedField,
      banquetNavigatorField.commitText,
      banquetNavigatorField.commitStyle,
    ]
  );

  // --- Floating toolbar: which section (if any) currently has a selected
  // field, and that field's live DOM node for position math. ---
  type Selection = { section: "hero" | SectionKey; field: string };
  const selection: Selection | null = useMemo(
    () =>
      heroSelectedField
        ? { section: "hero", field: heroSelectedField }
        : letterField.selectedField
          ? { section: "letter", field: letterField.selectedField }
          : timelineField.selectedField
            ? { section: "timeline", field: timelineField.selectedField }
            : mapField.selectedField
              ? { section: "map", field: mapField.selectedField }
              : rsvpField.selectedField
                ? { section: "rsvp", field: rsvpField.selectedField }
                : countdownField.selectedField
                  ? { section: "countdown", field: countdownField.selectedField }
                  : giftField.selectedField
                    ? { section: "gift", field: giftField.selectedField }
                    : dressCodeField.selectedField
                      ? { section: "dressCode", field: dressCodeField.selectedField }
                      : guestbookField.selectedField
                        ? { section: "guestbook", field: guestbookField.selectedField }
                        : videoField.selectedField
                          ? { section: "video", field: videoField.selectedField }
                          : banquetNavigatorField.selectedField
                            ? { section: "banquetNavigator", field: banquetNavigatorField.selectedField }
                            : null,
    [
      heroSelectedField,
      letterField.selectedField,
      timelineField.selectedField,
      mapField.selectedField,
      rsvpField.selectedField,
      countdownField.selectedField,
      giftField.selectedField,
      dressCodeField.selectedField,
      guestbookField.selectedField,
      videoField.selectedField,
      banquetNavigatorField.selectedField,
    ]
  );

  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);
  const [toolbarEl, setToolbarEl] = useState<HTMLDivElement | null>(null);

  // Positioned with `position: fixed` directly off the target's viewport-
  // relative rect (not relative to `scrollAreaEl`'s scrolled content) --
  // an earlier version measured relative to the scroll container and added
  // its scrollTop back in, which went stale whenever focusing the newly
  // contentEditable target triggered the browser's own scroll-into-view
  // (confirmed live: toolbar rendered hundreds of px off-screen after
  // selecting Letter's body field, whose auto-scroll-on-focus distance was
  // large enough to expose the bug that Hero's already-in-view fields
  // never triggered). Viewport-relative math has no scroll bookkeeping to
  // go stale -- it's simply wherever the target visually is right now.
  const recomputeToolbarPos = useCallback(() => {
    if (!selection) {
      setToolbarPos(null);
      return;
    }
    const container = sectionRefs[selection.section].current;
    const target = container?.querySelector<HTMLElement>(`[data-field="${CSS.escape(selection.field)}"]`);
    if (!target) {
      setToolbarPos(null);
      return;
    }
    const rect = target.getBoundingClientRect();
    const toolbarHeight = toolbarEl?.offsetHeight ?? 0;
    const gap = 8;
    const top = rect.top - toolbarHeight - gap >= 0 ? rect.top - toolbarHeight - gap : rect.bottom + gap;
    const left = rect.left;
    setToolbarPos({ top, left });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection?.section, selection?.field, toolbarEl]);

  useEffect(() => {
    const id = setTimeout(recomputeToolbarPos, 0);
    return () => clearTimeout(id);
  }, [recomputeToolbarPos]);

  // Capture-phase + `true` on window, not just a listener on `scrollAreaEl`,
  // because selecting a field also focuses its now-contentEditable node
  // (see EditableText), and the browser's own scroll-into-view for that
  // focus can scroll the *outer page* (window), not just the inner
  // `scrollAreaEl` box -- confirmed live: toolbar went hundreds of px stale
  // after selecting a field that required a window-level scroll to reach,
  // because only `scrollAreaEl`'s own scroll was being listened for.
  useEffect(() => {
    window.addEventListener("scroll", recomputeToolbarPos, true);
    window.addEventListener("resize", recomputeToolbarPos);
    return () => {
      window.removeEventListener("scroll", recomputeToolbarPos, true);
      window.removeEventListener("resize", recomputeToolbarPos);
    };
  }, [recomputeToolbarPos]);

  // dashboard-audit.md B10: which section's undo/redo stack the visible
  // round buttons (and Ctrl+Z) act on. Tracks the *last* section a field was
  // selected in, not just the *currently* selected one -- confirmed live
  // that clicking away from a field you just edited (a completely normal
  // "type, then click elsewhere to see it") otherwise made Undo go inert
  // right when a user would actually reach for it, since `selection` itself
  // goes null the moment nothing is selected. Hero is excluded throughout
  // (no stack of its own; native contentEditable undo covers its one field).
  const [lastEditedSection, setLastEditedSection] = useState<SectionKey | null>(null);
  useEffect(() => {
    if (!selection || selection.section === "hero") return;
    const id = setTimeout(() => setLastEditedSection(selection.section as SectionKey), 0);
    return () => clearTimeout(id);
  }, [selection]);
  const activeSection = selection && selection.section !== "hero" ? selection.section : lastEditedSection;

  const activeField =
    activeSection === "letter"
      ? letterField
      : activeSection === "timeline"
        ? timelineField
        : activeSection === "map"
          ? mapField
          : activeSection === "rsvp"
            ? rsvpField
            : activeSection === "countdown"
              ? countdownField
              : activeSection === "gift"
                ? giftField
                : activeSection === "dressCode"
                  ? dressCodeField
                  : activeSection === "guestbook"
                    ? guestbookField
                    : activeSection === "video"
                      ? videoField
                      : activeSection === "banquetNavigator"
                        ? banquetNavigatorField
                        : null;

  // EditableText deliberately renders no children for the field currently
  // selected (so a re-render mid-typing can't clobber the user's cursor --
  // see its own comment), which also means an undo/redo while that same
  // field is still selected updates the draft but not what's on screen.
  // Clearing the selection here forces it to fall back to plain `value`
  // rendering, confirmed live: without this, clicking the new visible Undo
  // button looked like it did nothing until the field was clicked away from.
  const runUndo = () => {
    activeField?.undo();
    activeField?.setSelectedField(null);
  };
  const runRedo = () => {
    activeField?.redo();
    activeField?.setSelectedField(null);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "z") return;
      if (!activeField) return;
      event.preventDefault();
      if (event.shiftKey) runRedo();
      else runUndo();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeField]);

  const clearSelection = () => {
    setHeroSelectedField(null);
    letterField.setSelectedField(null);
    timelineField.setSelectedField(null);
    mapField.setSelectedField(null);
    rsvpField.setSelectedField(null);
    countdownField.setSelectedField(null);
    giftField.setSelectedField(null);
    dressCodeField.setSelectedField(null);
    guestbookField.setSelectedField(null);
    videoField.setSelectedField(null);
    banquetNavigatorField.setSelectedField(null);
  };

  const currentOverride: TextStyleOverride | undefined = selection
    ? selection.section === "hero"
      ? heroOverrides?.[selection.field]
      : selection.section === "letter"
        ? letterField.draft.styleOverrides?.[selection.field]
        : selection.section === "timeline"
          ? timelineField.draft.styleOverrides?.[selection.field]
          : selection.section === "map"
            ? mapField.draft.styleOverrides?.[selection.field]
            : selection.section === "rsvp"
              ? rsvpField.draft.styleOverrides?.[selection.field]
              : selection.section === "countdown"
                ? countdownField.draft.styleOverrides?.[selection.field]
                : selection.section === "gift"
                  ? giftField.draft.styleOverrides?.[selection.field]
                  : selection.section === "dressCode"
                    ? dressCodeField.draft.styleOverrides?.[selection.field]
                    : selection.section === "guestbook"
                      ? guestbookField.draft.styleOverrides?.[selection.field]
                      : selection.section === "video"
                        ? videoField.draft.styleOverrides?.[selection.field]
                        : banquetNavigatorField.draft.styleOverrides?.[selection.field]
    : undefined;

  const handleToolbarUpdate = (patch: TextStyleOverride) => {
    if (!selection) return;
    if (selection.section === "hero") heroCommitStyle(selection.field, { ...currentOverride, ...patch });
    else if (selection.section === "letter") letterField.commitStyle(selection.field, { ...currentOverride, ...patch });
    else if (selection.section === "timeline") timelineField.commitStyle(selection.field, { ...currentOverride, ...patch });
    else if (selection.section === "map") mapField.commitStyle(selection.field, { ...currentOverride, ...patch });
    else if (selection.section === "rsvp") rsvpField.commitStyle(selection.field, { ...currentOverride, ...patch });
    else if (selection.section === "countdown") countdownField.commitStyle(selection.field, { ...currentOverride, ...patch });
    else if (selection.section === "gift") giftField.commitStyle(selection.field, { ...currentOverride, ...patch });
    else if (selection.section === "dressCode") dressCodeField.commitStyle(selection.field, { ...currentOverride, ...patch });
    else if (selection.section === "guestbook") guestbookField.commitStyle(selection.field, { ...currentOverride, ...patch });
    else if (selection.section === "video") videoField.commitStyle(selection.field, { ...currentOverride, ...patch });
    else banquetNavigatorField.commitStyle(selection.field, { ...currentOverride, ...patch });
  };

  const handleToolbarReset = () => {
    if (!selection) return;
    if (selection.section === "hero") heroCommitStyle(selection.field, null);
    else if (selection.section === "letter") letterField.commitStyle(selection.field, null);
    else if (selection.section === "timeline") timelineField.commitStyle(selection.field, null);
    else if (selection.section === "map") mapField.commitStyle(selection.field, null);
    else if (selection.section === "rsvp") rsvpField.commitStyle(selection.field, null);
    else if (selection.section === "countdown") countdownField.commitStyle(selection.field, null);
    else if (selection.section === "gift") giftField.commitStyle(selection.field, null);
    else if (selection.section === "dressCode") dressCodeField.commitStyle(selection.field, null);
    else if (selection.section === "guestbook") guestbookField.commitStyle(selection.field, null);
    else if (selection.section === "video") videoField.commitStyle(selection.field, null);
    else banquetNavigatorField.commitStyle(selection.field, null);
  };

  const heroNames = weddingDataDraft.name2 ? [weddingDataDraft.name1, weddingDataDraft.name2] : [weddingDataDraft.name1];
  const heroVisible = applyHiddenFields({ names: heroNames, photoUrl: heroPhoto }, heroHidden);
  // Sections rendered from named props (not a `{...draft}` spread) read
  // through one of these instead of the raw draft, so a hidden field's
  // value is blanked before it reaches the live component here too --
  // matching what registry.tsx's `applyHiddenFields` already does for the
  // public site, so hiding looks the same in both places.
  const rsvpVisible = applyHiddenFields(rsvpField.draft, rsvpField.draft.hiddenFields);
  const countdownVisible = applyHiddenFields(countdownField.draft, countdownField.draft.hiddenFields);
  const giftVisible = applyHiddenFields(giftField.draft, giftField.draft.hiddenFields);
  const dressCodeVisible = applyHiddenFields(dressCodeField.draft, dressCodeField.draft.hiddenFields);
  const guestbookVisible = applyHiddenFields(guestbookField.draft, guestbookField.draft.hiddenFields);
  const videoVisible = applyHiddenFields(videoField.draft, videoField.draft.hiddenFields);
  const banquetNavigatorVisible = applyHiddenFields(
    banquetNavigatorField.draft,
    banquetNavigatorField.draft.hiddenFields
  );

  // dashboard-audit.md A3: the flat "Editable blocks" tree -- every text/
  // image/auto field across every section, in the same order it renders.
  // Repeatable items (a Timeline event, Map venue, RSVP question, DressCode
  // color) get one "group" row for the item itself (select + delete) ahead
  // of its own sub-fields, the same adjacency weddingpost.ru's own tree
  // showed live between a "Групповой элемент" row and the text rows next to
  // it -- confirmed in Chrome this session, not guessed.
  const blocks: BlockRowData[] = [
    {
      ...makeRow({
        field: "names.0",
        label: weddingDataDraft.name1,
        type: "auto",
        hiddenFields: heroHidden,
        commitHidden: heroCommitHidden,
      }),
      onSelect: () => {
        setHeroSelectedField("names.0");
        scrollToField(heroRef.current, "names.0");
      },
    },
    ...(weddingDataDraft.name2
      ? [
          {
            ...makeRow({
              field: "names.1",
              label: weddingDataDraft.name2,
              type: "auto" as const,
              hiddenFields: heroHidden,
              commitHidden: heroCommitHidden,
            }),
            onSelect: () => {
              setHeroSelectedField("names.1");
              scrollToField(heroRef.current, "names.1");
            },
          },
        ]
      : []),
    {
      ...makeRow({
        field: "photoUrl",
        label: "Hero photo",
        type: "image",
        hiddenFields: heroHidden,
        commitHidden: heroCommitHidden,
      }),
      onSelect: () => {
        setHeroSelectedField("photoUrl");
        scrollToField(heroRef.current, "photoUrl");
      },
    },

    // Unrolled, not `.map()`'d -- react-hooks/refs flags a ref reached from
    // *any* function-call argument during render, including a callback
    // passed to `.map()`, no matter how deeply the actual `.current` read is
    // nested inside it (confirmed live: only the `.map()`-built rows were
    // flagged, identical plain-array-literal rows elsewhere were not).
    {
      ...makeRow({
        field: "title",
        label: letterField.draft.title,
        type: "text",
        hiddenFields: letterField.draft.hiddenFields,
        commitHidden: letterField.commitHidden,
      }),
      onSelect: () => {
        letterField.setSelectedField("title");
        scrollToField(letterRef.current, "title");
      },
    },
    {
      ...makeRow({
        field: "body",
        label: letterField.draft.body,
        type: "text",
        hiddenFields: letterField.draft.hiddenFields,
        commitHidden: letterField.commitHidden,
      }),
      onSelect: () => {
        letterField.setSelectedField("body");
        scrollToField(letterRef.current, "body");
      },
    },
    {
      ...makeRow({
        field: "quote",
        label: letterField.draft.quote,
        type: "text",
        hiddenFields: letterField.draft.hiddenFields,
        commitHidden: letterField.commitHidden,
      }),
      onSelect: () => {
        letterField.setSelectedField("quote");
        scrollToField(letterRef.current, "quote");
      },
    },
    {
      ...makeRow({
        field: "note",
        label: letterField.draft.note,
        type: "text",
        hiddenFields: letterField.draft.hiddenFields,
        commitHidden: letterField.commitHidden,
      }),
      onSelect: () => {
        letterField.setSelectedField("note");
        scrollToField(letterRef.current, "note");
      },
    },
    {
      ...makeRow({
        field: "rsvpDeadline",
        label: letterField.draft.rsvpDeadline,
        type: "text",
        hiddenFields: letterField.draft.hiddenFields,
        commitHidden: letterField.commitHidden,
      }),
      onSelect: () => {
        letterField.setSelectedField("rsvpDeadline");
        scrollToField(letterRef.current, "rsvpDeadline");
      },
    },
    {
      ...makeRow({
        field: "closingLine",
        label: letterField.draft.closingLine,
        type: "text",
        hiddenFields: letterField.draft.hiddenFields,
        commitHidden: letterField.commitHidden,
      }),
      onSelect: () => {
        letterField.setSelectedField("closingLine");
        scrollToField(letterRef.current, "closingLine");
      },
    },

    {
      ...makeRow({
        field: "title",
        label: timelineField.draft.title,
        type: "text",
        hiddenFields: timelineField.draft.hiddenFields,
        commitHidden: timelineField.commitHidden,
      }),
      onSelect: () => {
        timelineField.setSelectedField("title");
        scrollToField(timelineRef.current, "title");
      },
    },
    ...timelineField.draft.events.flatMap((event, index): BlockRowData[] => [
      {
        key: `timeline.events.${index}`,
        type: "group",
        label: event.title.trim() || `Event ${index + 1}`,
        hidden: false,
        onSelect: () => {
          timelineField.setSelectedField(`events.${index}.title`);
          scrollToField(timelineRef.current, `events.${index}.title`);
        },
        onDelete: () =>
          timelineField.setDraft((prev) => ({ ...prev, events: prev.events.filter((_, i) => i !== index) })),
      },
      ...(["time", "title", "description"] as const).map(
        (subfield): BlockRowData => ({
          ...makeRow({
            field: `events.${index}.${subfield}`,
            label: event[subfield] ?? "",
            type: "text",
            hiddenFields: timelineField.draft.hiddenFields,
            commitHidden: timelineField.commitHidden,
          }),
          onSelect: () => {
            timelineField.setSelectedField(`events.${index}.${subfield}`);
            scrollToField(timelineRef.current, `events.${index}.${subfield}`);
          },
        })
      ),
    ]),

    {
      ...makeRow({
        field: "title",
        label: mapField.draft.title,
        type: "text",
        hiddenFields: mapField.draft.hiddenFields,
        commitHidden: mapField.commitHidden,
      }),
      onSelect: () => {
        mapField.setSelectedField("title");
        scrollToField(mapRef.current, "title");
      },
    },
    ...mapField.draft.venues.flatMap((venue, index): BlockRowData[] => [
      {
        key: `map.venues.${index}`,
        type: "group",
        label: venue.name.trim() || `Venue ${index + 1}`,
        hidden: false,
        onSelect: () => {
          mapField.setSelectedField(`venues.${index}.name`);
          scrollToField(mapRef.current, `venues.${index}.name`);
        },
        onDelete: () =>
          mapField.setDraft((prev) => ({ ...prev, venues: prev.venues.filter((_, i) => i !== index) })),
      },
      ...(["name", "address"] as const).map(
        (subfield): BlockRowData => ({
          ...makeRow({
            field: `venues.${index}.${subfield}`,
            label: venue[subfield],
            type: "text",
            hiddenFields: mapField.draft.hiddenFields,
            commitHidden: mapField.commitHidden,
          }),
          onSelect: () => {
            mapField.setSelectedField(`venues.${index}.${subfield}`);
            scrollToField(mapRef.current, `venues.${index}.${subfield}`);
          },
        })
      ),
    ]),

    {
      ...makeRow({
        field: "title",
        label: rsvpField.draft.title,
        type: "text",
        hiddenFields: rsvpField.draft.hiddenFields,
        commitHidden: rsvpField.commitHidden,
      }),
      onSelect: () => {
        rsvpField.setSelectedField("title");
        scrollToField(rsvpRef.current, "title");
      },
    },
    {
      ...makeRow({
        field: "description",
        label: rsvpField.draft.description,
        type: "text",
        hiddenFields: rsvpField.draft.hiddenFields,
        commitHidden: rsvpField.commitHidden,
      }),
      onSelect: () => {
        rsvpField.setSelectedField("description");
        scrollToField(rsvpRef.current, "description");
      },
    },
    ...rsvpField.draft.questions.flatMap((question, index): BlockRowData[] => [
      {
        key: `rsvp.questions.${index}`,
        type: "group",
        label: question.label.trim() || `Question ${index + 1}`,
        hidden: false,
        onSelect: () => {
          rsvpField.setSelectedField(`questions.${index}.label`);
          scrollToField(rsvpRef.current, `questions.${index}.label`);
        },
        onDelete: () =>
          rsvpField.setDraft((prev) => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index) })),
      },
      {
        ...makeRow({
          field: `questions.${index}.label`,
          label: question.label,
          type: "text",
          hiddenFields: rsvpField.draft.hiddenFields,
          commitHidden: rsvpField.commitHidden,
        }),
        onSelect: () => {
          rsvpField.setSelectedField(`questions.${index}.label`);
          scrollToField(rsvpRef.current, `questions.${index}.label`);
        },
      },
    ]),

    {
      ...makeRow({
        field: "title",
        label: countdownField.draft.title,
        type: "text",
        hiddenFields: countdownField.draft.hiddenFields,
        commitHidden: countdownField.commitHidden,
      }),
      onSelect: () => {
        countdownField.setSelectedField("title");
        scrollToField(countdownRef.current, "title");
      },
    },

    {
      ...makeRow({
        field: "title",
        label: giftField.draft.title,
        type: "text",
        hiddenFields: giftField.draft.hiddenFields,
        commitHidden: giftField.commitHidden,
      }),
      onSelect: () => {
        giftField.setSelectedField("title");
        scrollToField(giftRef.current, "title");
      },
    },
    {
      ...makeRow({
        field: "description",
        label: giftField.draft.description,
        type: "text",
        hiddenFields: giftField.draft.hiddenFields,
        commitHidden: giftField.commitHidden,
      }),
      onSelect: () => {
        giftField.setSelectedField("description");
        scrollToField(giftRef.current, "description");
      },
    },

    {
      ...makeRow({
        field: "title",
        label: dressCodeField.draft.title,
        type: "text",
        hiddenFields: dressCodeField.draft.hiddenFields,
        commitHidden: dressCodeField.commitHidden,
      }),
      onSelect: () => {
        dressCodeField.setSelectedField("title");
        scrollToField(dressCodeRef.current, "title");
      },
    },
    {
      ...makeRow({
        field: "description",
        label: dressCodeField.draft.description,
        type: "text",
        hiddenFields: dressCodeField.draft.hiddenFields,
        commitHidden: dressCodeField.commitHidden,
      }),
      onSelect: () => {
        dressCodeField.setSelectedField("description");
        scrollToField(dressCodeRef.current, "description");
      },
    },
    ...dressCodeField.draft.colors.flatMap((color, index): BlockRowData[] => [
      {
        key: `dressCode.colors.${index}`,
        type: "group",
        label: color.label?.trim() || `Color ${index + 1}`,
        hidden: false,
        onSelect: () => {
          dressCodeField.setSelectedField(`colors.${index}.label`);
          scrollToField(dressCodeRef.current, `colors.${index}.label`);
        },
        onDelete: () =>
          dressCodeField.setDraft((prev) => ({ ...prev, colors: prev.colors.filter((_, i) => i !== index) })),
      },
      {
        ...makeRow({
          field: `colors.${index}.label`,
          label: color.label ?? "",
          type: "text",
          hiddenFields: dressCodeField.draft.hiddenFields,
          commitHidden: dressCodeField.commitHidden,
        }),
        onSelect: () => {
          dressCodeField.setSelectedField(`colors.${index}.label`);
          scrollToField(dressCodeRef.current, `colors.${index}.label`);
        },
      },
    ]),

    {
      ...makeRow({
        field: "title",
        label: guestbookField.draft.title,
        type: "text",
        hiddenFields: guestbookField.draft.hiddenFields,
        commitHidden: guestbookField.commitHidden,
      }),
      onSelect: () => {
        guestbookField.setSelectedField("title");
        scrollToField(guestbookRef.current, "title");
      },
    },

    {
      ...makeRow({
        field: "title",
        label: videoField.draft.title,
        type: "text",
        hiddenFields: videoField.draft.hiddenFields,
        commitHidden: videoField.commitHidden,
      }),
      onSelect: () => {
        videoField.setSelectedField("title");
        scrollToField(videoRef.current, "title");
      },
    },

    {
      ...makeRow({
        field: "title",
        label: banquetNavigatorField.draft.title,
        type: "text",
        hiddenFields: banquetNavigatorField.draft.hiddenFields,
        commitHidden: banquetNavigatorField.commitHidden,
      }),
      onSelect: () => {
        banquetNavigatorField.setSelectedField("title");
        scrollToField(banquetNavigatorRef.current, "title");
      },
    },
    {
      ...makeRow({
        field: "description",
        label: banquetNavigatorField.draft.description,
        type: "text",
        hiddenFields: banquetNavigatorField.draft.hiddenFields,
        commitHidden: banquetNavigatorField.commitHidden,
      }),
      onSelect: () => {
        banquetNavigatorField.setSelectedField("description");
        scrollToField(banquetNavigatorRef.current, "description");
      },
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <EditableBlocksPanel blocks={blocks} />

      {/* dashboard-audit.md B10: weddingpost.ru's own top bar centers big
          round undo/redo arrows -- these drive the same per-section stack
          Ctrl+Z already used, just exposed as clickable buttons too. */}
      <div className="mx-auto flex w-full items-center justify-between" style={{ maxWidth: deviceMaxWidth }}>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={runUndo}
            disabled={!activeField?.canUndo}
            aria-label="Undo"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--dash-border)] text-[var(--dash-text-muted)] transition hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--dash-border)] disabled:hover:text-[var(--dash-text-muted)]"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={runRedo}
            disabled={!activeField?.canRedo}
            aria-label="Redo"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--dash-border)] text-[var(--dash-text-muted)] transition hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--dash-border)] disabled:hover:text-[var(--dash-text-muted)]"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-0.5 rounded-full bg-[var(--dash-surface-2)] p-0.5">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            aria-pressed={device === "desktop"}
            aria-label="Preview at desktop width"
            className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
              device === "desktop"
                ? "bg-[var(--dash-accent)] text-[var(--dash-accent-contrast)]"
                : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
            }`}
          >
            <Monitor className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDevice("phone")}
            aria-pressed={device === "phone"}
            aria-label="Preview at phone width"
            className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
              device === "phone"
                ? "bg-[var(--dash-accent)] text-[var(--dash-accent-contrast)]"
                : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDevice("tablet")}
            aria-pressed={device === "tablet"}
            aria-label="Preview at tablet width"
            className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
              device === "tablet"
                ? "bg-[var(--dash-accent)] text-[var(--dash-accent-contrast)]"
                : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
            }`}
          >
            <Tablet className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* dashboard-audit.md A2's device frame, moved here from page.tsx so
          it can sit right under the tree above instead of the tree living
          outside a wrapper that only page.tsx controlled. Desktop skips the
          phone-style bezel/notch entirely -- a heavy phone frame around a
          1280px-wide view would read as a mockup again, the opposite of
          the point, so it gets a plain browser-window chrome instead. */}
      <div
        className={
          device === "desktop"
            ? "mx-auto w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-2)] shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-[max-width]"
            : "mx-auto w-full rounded-[2.5rem] border-[10px] border-[var(--dash-surface-2)] bg-[var(--dash-surface-2)] shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-[max-width]"
        }
        style={{ maxWidth: deviceMaxWidth }}
      >
        {device === "desktop" ? (
          <div className="flex items-center gap-1.5 rounded-t-xl px-3.5 py-2.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
          </div>
        ) : (
          <span className="mx-auto mb-1 block h-1.5 w-16 rounded-full bg-black/30" aria-hidden="true" />
        )}
        <div className={device === "desktop" ? "overflow-hidden rounded-b-xl bg-white" : "overflow-hidden rounded-[1.75rem] bg-white"}>
          <div
            ref={scrollAreaRef}
            className="relative max-h-[85vh] overflow-y-auto rounded-2xl"
            onClick={clearSelection}
          >
            <ThemeProvider theme={theme}>
        <SectionBackground fill={getSectionBackground("hero")}>
          <div ref={heroRef}>
            <EditableFieldProvider value={heroContext}>
              <HeroSection
                variant={heroVariant}
                names={heroVisible.names}
                eventDate={weddingDataDraft.eventDate}
                photoUrl={heroVisible.photoUrl}
                styleOverrides={heroOverrides}
                eyebrow={getEventType(weddingDataDraft.eventType).heroEyebrow}
              />
            </EditableFieldProvider>
          </div>
        </SectionBackground>

        <SectionHeader
          label="Hero photo"
          state={heroState}
          error={heroError}
          extra={
            <>
              <SectionBackgroundButton
                value={getSectionBackground("hero")}
                onChange={(fill) => handleBackgroundChange("hero", fill)}
              />
              <AutosaveStatus state={weddingDataState} error={weddingDataError} />
            </>
          }
        />
        <div className="px-4 pb-4" onClick={(event) => event.stopPropagation()}>
          <PhotoDropzone value={heroPhoto || undefined} onChange={(url) => setHeroPhoto(url ?? "")} label="📷 Photo" />
        </div>

        <SectionHeader
          label={sectionLabels.letter}
          enabled={letter.enabled}
          state={letterField.state}
          error={letterField.error}
          extra={
            <SectionBackgroundButton
              value={getSectionBackground("letter")}
              onChange={(fill) => handleBackgroundChange("letter", fill)}
            />
          }
        />
        <SectionBackground fill={getSectionBackground("letter")}>
          <div ref={letterRef}>
            <EditableFieldProvider value={letterContext}>
              <LetterSection
                variant={letter.variant}
                {...applyHiddenFields(letterField.draft, letterField.draft.hiddenFields)}
              />
            </EditableFieldProvider>
          </div>
        </SectionBackground>

        <SectionHeader
          label={sectionLabels.timeline}
          enabled={timeline.enabled}
          state={timelineField.state}
          error={timelineField.error}
          extra={
            <SectionBackgroundButton
              value={getSectionBackground("timeline")}
              onChange={(fill) => handleBackgroundChange("timeline", fill)}
            />
          }
        />
        <SectionBackground fill={getSectionBackground("timeline")}>
          <div ref={timelineRef}>
            <EditableFieldProvider value={timelineContext}>
              <TimelineSection
                variant={timeline.variant}
                {...applyHiddenFields(timelineField.draft, timelineField.draft.hiddenFields)}
              />
            </EditableFieldProvider>
          </div>
        </SectionBackground>
        <div className="flex justify-center pb-6" onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            onClick={() =>
              timelineField.setDraft((prev) => ({
                ...prev,
                events: [...prev.events, { time: "", title: "New event", description: "" }],
              }))
            }
            className="dash-btn dash-btn-neutral text-xs"
          >
            + Add event
          </button>
        </div>

        <SectionHeader
          label={sectionLabels.map}
          enabled={map.enabled}
          state={mapField.state}
          error={mapField.error}
          extra={
            <SectionBackgroundButton
              value={getSectionBackground("map")}
              onChange={(fill) => handleBackgroundChange("map", fill)}
            />
          }
        />
        <SectionBackground fill={getSectionBackground("map")}>
          <div ref={mapRef}>
            <EditableFieldProvider value={mapContext}>
              <MapSection variant={map.variant} {...applyHiddenFields(mapField.draft, mapField.draft.hiddenFields)} />
            </EditableFieldProvider>
          </div>
        </SectionBackground>
        <div className="flex justify-center pb-6" onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            onClick={() =>
              mapField.setDraft((prev) => {
                // First venue on the block starts from Wedding Data's own
                // venue name/city/address instead of a placeholder -- an
                // untouched "New venue" / "" pair isn't just a cosmetic
                // placeholder, it becomes a literal Google Maps text query
                // ("New venue, ") that resolves to a real, unrelated
                // business somewhere in the world rather than the wedding's
                // actual location. Only the very first venue gets this --
                // a second/third venue has no single "the" venue to infer
                // from Wedding Data, so it falls back to the old placeholder.
                const isFirstVenue = prev.venues.length === 0;
                const address = [weddingDataDraft.venueAddress, weddingDataDraft.venueCity]
                  .filter(Boolean)
                  .join(", ");
                const seeded =
                  isFirstVenue && (weddingDataDraft.venueName || address)
                    ? { name: weddingDataDraft.venueName || "New venue", address }
                    : { name: "New venue", address: "" };
                return { ...prev, venues: [...prev.venues, seeded] };
              })
            }
            className="dash-btn dash-btn-neutral text-xs"
          >
            + Add venue
          </button>
        </div>

        <SectionHeader
          label={sectionLabels.rsvp}
          enabled={rsvp.enabled}
          state={rsvpField.state}
          error={rsvpField.error}
          extra={
            <SectionBackgroundButton
              value={getSectionBackground("rsvp")}
              onChange={(fill) => handleBackgroundChange("rsvp", fill)}
            />
          }
        />
        <SectionBackground fill={getSectionBackground("rsvp")}>
          <div ref={rsvpRef}>
            <EditableFieldProvider value={rsvpContext}>
              <RsvpSection
                variant="simple-form"
                title={rsvpVisible.title}
                description={rsvpVisible.description}
                styleOverrides={rsvpField.draft.styleOverrides}
                questions={rsvpQuestionsForRender(rsvpVisible.questions)}
                onSubmit={previewOnlySubmit}
                // Dashboard preview always shows English RSVP chrome --
                // this canvas is the host's own editing view, not what a
                // guest in their chosen language sees; a host-facing locale
                // picker for their own preview is a separate follow-up, not
                // part of this guest-facing-site i18n pass.
                locale={DEFAULT_LOCALE}
              />
            </EditableFieldProvider>
          </div>
        </SectionBackground>
        <div className="px-4 pb-6" onClick={(event) => event.stopPropagation()}>
          <RsvpQuestionsManager
            questions={rsvpField.draft.questions}
            onChange={(questions) => rsvpField.setDraft((prev) => ({ ...prev, questions }))}
          />
        </div>

        <SectionHeader
          label={sectionLabels.countdown}
          enabled={countdown.enabled}
          state={countdownField.state}
          error={countdownField.error}
          extra={
            <SectionBackgroundButton
              value={getSectionBackground("countdown")}
              onChange={(fill) => handleBackgroundChange("countdown", fill)}
            />
          }
        />
        <SectionBackground fill={getSectionBackground("countdown")}>
          <div ref={countdownRef}>
            <EditableFieldProvider value={countdownContext}>
              <CountdownSection
                variant={countdown.variant}
                title={countdownVisible.title}
                eventDateTime={`${weddingDataDraft.eventDate}T00:00:00`}
                styleOverrides={countdownField.draft.styleOverrides}
              />
            </EditableFieldProvider>
          </div>
        </SectionBackground>

        <SectionHeader
          label={sectionLabels.gift}
          enabled={gift.enabled}
          state={giftField.state}
          error={giftField.error}
          extra={
            <SectionBackgroundButton
              value={getSectionBackground("gift")}
              onChange={(fill) => handleBackgroundChange("gift", fill)}
            />
          }
        />
        <SectionBackground fill={getSectionBackground("gift")}>
          <div ref={giftRef}>
            <EditableFieldProvider value={giftContext}>
              <GiftSection
                variant={gift.variant}
                title={giftVisible.title}
                description={giftVisible.description}
                styleOverrides={giftField.draft.styleOverrides}
                preferences={giftPreferencesForRender(gift.preferences)}
              />
            </EditableFieldProvider>
          </div>
        </SectionBackground>
        <div className="px-4 pb-6" onClick={(event) => event.stopPropagation()}>
          <GiftWishesManager eventId={eventId} preferences={gift.preferences} />
        </div>

        <SectionHeader
          label={sectionLabels.dressCode}
          enabled={dressCode.enabled}
          state={dressCodeField.state}
          error={dressCodeField.error}
          extra={
            <SectionBackgroundButton
              value={getSectionBackground("dressCode")}
              onChange={(fill) => handleBackgroundChange("dressCode", fill)}
            />
          }
        />
        <SectionBackground fill={getSectionBackground("dressCode")}>
          <div ref={dressCodeRef}>
            <EditableFieldProvider value={dressCodeContext}>
              <DressCodeSection
                variant={dressCode.variant}
                title={dressCodeVisible.title}
                description={dressCodeVisible.description}
                colors={dressCodeVisible.colors}
                styleOverrides={dressCodeField.draft.styleOverrides}
              />
            </EditableFieldProvider>
          </div>
        </SectionBackground>
        <div className="px-4 pb-6" onClick={(event) => event.stopPropagation()}>
          <DressCodeColorsManager
            colors={dressCodeField.draft.colors}
            onChange={(colors) => dressCodeField.setDraft((prev) => ({ ...prev, colors }))}
          />
        </div>

        <SectionHeader
          label={sectionLabels.guestbook}
          enabled={guestbook.enabled}
          state={guestbookField.state}
          error={guestbookField.error}
          extra={
            <SectionBackgroundButton
              value={getSectionBackground("guestbook")}
              onChange={(fill) => handleBackgroundChange("guestbook", fill)}
            />
          }
        />
        <SectionBackground fill={getSectionBackground("guestbook")}>
          <div ref={guestbookRef}>
            <EditableFieldProvider value={guestbookContext}>
              <GuestbookSection
                variant={guestbook.variant}
                title={guestbookVisible.title}
                styleOverrides={guestbookField.draft.styleOverrides}
                messages={guestbook.messages}
              />
            </EditableFieldProvider>
          </div>
        </SectionBackground>
        <div className="px-4 pb-6 text-xs text-[var(--dash-text-muted)]" onClick={(event) => event.stopPropagation()}>
          Messages come from guests&apos; RSVP comments. Hide or show individual messages from the Guests tab.
        </div>

        <SectionHeader
          label={sectionLabels.video}
          enabled={video.enabled}
          state={videoField.state}
          error={videoField.error}
          extra={
            <SectionBackgroundButton
              value={getSectionBackground("video")}
              onChange={(fill) => handleBackgroundChange("video", fill)}
            />
          }
        />
        <SectionBackground fill={getSectionBackground("video")}>
          <div ref={videoRef}>
            <EditableFieldProvider value={videoContext}>
              <VideoSection
                variant={video.variant}
                title={videoVisible.title}
                videoUrl={videoVisible.videoUrl}
                styleOverrides={videoField.draft.styleOverrides}
              />
            </EditableFieldProvider>
          </div>
        </SectionBackground>
        <div className="px-4 pb-6" onClick={(event) => event.stopPropagation()}>
          <VideoUrlManager
            videoUrl={videoField.draft.videoUrl}
            onChange={(videoUrl) => videoField.setDraft((prev) => ({ ...prev, videoUrl }))}
          />
        </div>

        <SectionHeader
          label={banquetNavigator.seatingLabel}
          enabled={banquetNavigator.enabled}
          state={banquetNavigatorField.state}
          error={banquetNavigatorField.error}
          extra={
            <SectionBackgroundButton
              value={getSectionBackground("banquetNavigator")}
              onChange={(fill) => handleBackgroundChange("banquetNavigator", fill)}
            />
          }
        />
        <SectionBackground fill={getSectionBackground("banquetNavigator")}>
          <div ref={banquetNavigatorRef}>
            <EditableFieldProvider value={banquetNavigatorContext}>
              <BanquetNavigatorSection
                variant="simple-lookup"
                title={banquetNavigatorVisible.title}
                description={banquetNavigatorVisible.description}
                styleOverrides={banquetNavigatorField.draft.styleOverrides}
                onLookup={previewOnlyLookup}
              />
            </EditableFieldProvider>
          </div>
        </SectionBackground>
      </ThemeProvider>

      {selection && toolbarPos && (
        <InlineFieldToolbar
          position={toolbarPos}
          override={currentOverride}
          showAlign={
            selection.section === "letter" ||
            selection.section === "map" ||
            selection.section === "rsvp" ||
            selection.section === "gift" ||
            selection.section === "dressCode" ||
            selection.section === "guestbook" ||
            selection.section === "video" ||
            selection.section === "banquetNavigator"
          }
          onUpdate={handleToolbarUpdate}
          onReset={handleToolbarReset}
          measureRef={setToolbarEl}
          onDelete={
            selection.section === "timeline" && /^events\.\d+\./.test(selection.field)
              ? () => {
                  const index = Number(selection.field.split(".")[1]);
                  timelineField.setDraft((prev) => ({ ...prev, events: prev.events.filter((_, i) => i !== index) }));
                  clearSelection();
                }
              : selection.section === "map" && /^venues\.\d+\./.test(selection.field)
                ? () => {
                    const index = Number(selection.field.split(".")[1]);
                    mapField.setDraft((prev) => ({ ...prev, venues: prev.venues.filter((_, i) => i !== index) }));
                    clearSelection();
                  }
                : selection.section === "rsvp" && /^questions\.\d+\./.test(selection.field)
                  ? () => {
                      const index = Number(selection.field.split(".")[1]);
                      rsvpField.setDraft((prev) => ({
                        ...prev,
                        questions: prev.questions.filter((_, i) => i !== index),
                      }));
                      clearSelection();
                    }
                  : selection.section === "dressCode" && /^colors\.\d+\./.test(selection.field)
                    ? () => {
                        const index = Number(selection.field.split(".")[1]);
                        dressCodeField.setDraft((prev) => ({
                          ...prev,
                          colors: prev.colors.filter((_, i) => i !== index),
                        }));
                        clearSelection();
                      }
                    : undefined
          }
        />
      )}
          </div>
        </div>
      </div>
    </div>
  );
}

function makeQuestionId() {
  return crypto.randomUUID();
}

/** RSVP questions have a `type`/`options` config that isn't rendered as
 * clickable guest-facing text (the question *label* is -- see `EditableText`
 * inside `SimpleForm` -- but a `<select>`'s option list has no text node to
 * click into). Kept as a compact dashboard-only strip below the live form,
 * same precedent as Hero's photo `PhotoDropzone` sitting below the live
 * section rather than being click-to-edit itself. */
function RsvpQuestionsManager({
  questions,
  onChange,
}: {
  questions: RsvpQuestionDraft[];
  onChange: (questions: RsvpQuestionDraft[]) => void;
}) {
  const updateQuestion = (index: number, patch: Partial<RsvpQuestionDraft>) => {
    onChange(questions.map((question, i) => (i === index ? { ...question, ...patch } : question)));
  };

  return (
    <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-text-muted)]">
        Question settings
      </p>
      <p className="mt-1 text-xs text-[var(--dash-text-muted)]">
        Click a question&apos;s text above to edit its wording. Type and choices are set here.
      </p>
      <div className="mt-3 space-y-2">
        {questions.map((question, index) => (
          <div key={question.id} className="flex flex-wrap items-center gap-2 text-xs">
            <span className="min-w-0 flex-1 truncate text-[var(--dash-text)]">
              {question.label || <span className="text-[var(--dash-text-muted)]">(untitled question)</span>}
            </span>
            <select
              value={question.type}
              onChange={(event) => updateQuestion(index, { type: event.target.value as "text" | "choice" })}
              className="rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface-2)] px-2 py-1 text-[var(--dash-text)]"
            >
              <option value="text">Free text</option>
              <option value="choice">Multiple choice</option>
            </select>
            {question.type === "choice" && (
              <input
                type="text"
                placeholder="Options, comma-separated"
                value={question.options}
                onChange={(event) => updateQuestion(index, { options: event.target.value })}
                className="min-w-[160px] flex-1 rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface-2)] px-2 py-1 text-[var(--dash-text)]"
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange([...questions, { id: makeQuestionId(), label: "New question", type: "text", options: "" }])}
          className="dash-btn dash-btn-neutral text-xs"
        >
          + Add question
        </button>
        <button
          type="button"
          onClick={() =>
            onChange([
              ...questions,
              { id: makeQuestionId(), label: "Meal preference", type: "choice", options: "Chicken, Fish, Vegetarian" },
            ])
          }
          className="dash-btn dash-btn-neutral text-xs"
        >
          + Meal preference
        </button>
      </div>
    </div>
  );
}

/** The video URL has no clickable text node in the rendered iframe/video
 * itself -- a small labeled input below the live section, same precedent as
 * Hero's `PhotoDropzone` sitting below its own live section. */
function VideoUrlManager({ videoUrl, onChange }: { videoUrl: string; onChange: (videoUrl: string) => void }) {
  return (
    <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3">
      <label htmlFor="video-url-input" className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-text-muted)]">
        Video URL
      </label>
      <p className="mt-1 text-xs text-[var(--dash-text-muted)]">
        Paste a YouTube or Vimeo link, or a direct video file URL.
      </p>
      <input
        id="video-url-input"
        type="text"
        placeholder="https://youtube.com/watch?v=..."
        value={videoUrl}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface-2)] px-2 py-1.5 text-xs text-[var(--dash-text)]"
      />
    </div>
  );
}

/** Color hex values have no clickable text node on the public site (the
 * swatch is a plain `<span style={{backgroundColor}}>`, not text) -- only
 * each color's optional `label` is inline-editable via `EditableText` in
 * the variants above. Hex + add/remove live here instead, same precedent
 * as `RsvpQuestionsManager` sitting below the live section. */
function DressCodeColorsManager({
  colors,
  onChange,
}: {
  colors: DressCodeColor[];
  onChange: (colors: DressCodeColor[]) => void;
}) {
  const updateColor = (index: number, patch: Partial<DressCodeColor>) => {
    onChange(colors.map((color, i) => (i === index ? { ...color, ...patch } : color)));
  };

  return (
    <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-text-muted)]">
        Color palette
      </p>
      <p className="mt-1 text-xs text-[var(--dash-text-muted)]">
        Click a color&apos;s label above to edit its wording. Hex values are set here.
      </p>
      <div className="mt-3 space-y-2">
        {colors.map((color, index) => (
          <div key={`${color.hex}-${index}`} className="flex flex-wrap items-center gap-2 text-xs">
            <input
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(color.hex) ? color.hex : "#000000"}
              onChange={(event) => updateColor(index, { hex: event.target.value })}
              className="h-7 w-7 shrink-0 cursor-pointer rounded border border-[var(--dash-border)] bg-transparent p-0"
            />
            <input
              type="text"
              value={color.hex}
              onChange={(event) => updateColor(index, { hex: event.target.value })}
              className="w-24 rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface-2)] px-2 py-1 text-[var(--dash-text)]"
            />
            <span className="min-w-0 flex-1 truncate text-[var(--dash-text)]">
              {color.label || <span className="text-[var(--dash-text-muted)]">(no label)</span>}
            </span>
            <button
              type="button"
              onClick={() => onChange(colors.filter((_, i) => i !== index))}
              className="dash-btn dash-btn-neutral text-xs"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <button
          type="button"
          onClick={() => onChange([...colors, { hex: "#000000", label: "New color" }])}
          className="dash-btn dash-btn-neutral text-xs"
        >
          + Add color
        </button>
      </div>
    </div>
  );
}

/** Whether a section is on/off is now controlled exclusively by
 * SectionModulesPanel (dashboard-audit.md A1) -- this header used to carry
 * its own duplicate toggle switch, which meant two different controls could
 * disagree about the same section's enabled state. Only a plain, non-
 * interactive "Off" badge remains here, so an editor mid-edit can still see
 * at a glance that a section won't show on the live site without a second
 * place to change it. */
function SectionHeader({
  label,
  enabled,
  state,
  error,
  extra,
}: {
  label: string;
  enabled?: boolean;
  state: AutosaveState;
  error: string | null;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-t border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 py-2">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-text-muted)]">{label}</span>
        {enabled === false && (
          <span className="rounded-full bg-[var(--dash-border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--dash-text-muted)]">
            Off
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {extra}
        <AutosaveStatus state={state} error={error} />
      </div>
    </div>
  );
}

const BLOCK_TYPE_ICON: Record<BlockRowData["type"], string> = {
  text: "A",
  image: "🖼",
  auto: "🖊",
  group: "⊞",
};

/** dashboard-audit.md A3: "Editable blocks" -- a flat, counted list of every
 * text/image/auto field on the page, labeled with the block's own current
 * text rather than a generated name ("не «Layer 12», а сам текст блока",
 * confirmed against weddingpost.ru's own tree in Chrome this session).
 * Clicking a row selects + scrolls to that field in the canvas below; the
 * eye icon toggles `hiddenFields` (reversible -- the stored value is never
 * touched, only withheld from render, see `applyHiddenFields`); the trash
 * icon (repeatable items only) removes that item outright, the same
 * operation the floating toolbar's own delete button already does. */
function EditableBlocksPanel({ blocks }: { blocks: BlockRowData[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[var(--dash-accent)]">
          Editable blocks
          <span className="rounded-full bg-[var(--dash-surface-2)] px-2 py-0.5 text-xs font-normal text-[var(--dash-text-muted)]">
            {blocks.length}
          </span>
        </span>
        <span className="text-xs text-[var(--dash-text-muted)]">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <ul className="mt-3 max-h-64 space-y-0.5 overflow-y-auto">
          {blocks.map((block) => (
            <li
              key={block.key}
              className={`group flex items-center justify-between gap-2 rounded-md px-2 py-1 text-xs hover:bg-[var(--dash-surface-2)] ${
                block.hidden ? "opacity-40" : ""
              } ${block.type === "group" ? "mt-1 font-semibold text-[var(--dash-text-muted)]" : ""}`}
            >
              <button
                type="button"
                onClick={block.onSelect}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <span aria-hidden="true" className="w-4 shrink-0 text-center text-[var(--dash-text-muted)]">
                  {BLOCK_TYPE_ICON[block.type]}
                </span>
                <span className="truncate text-[var(--dash-text)]">{block.label}</span>
              </button>
              <span className="hidden shrink-0 items-center gap-1 group-hover:flex">
                {block.onToggleHidden && (
                  <button
                    type="button"
                    onClick={block.onToggleHidden}
                    className="rounded px-1 text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
                    aria-label={block.hidden ? "Show block" : "Hide block"}
                  >
                    {block.hidden ? "🚫" : "👁"}
                  </button>
                )}
                {block.onDelete && (
                  <button
                    type="button"
                    onClick={block.onDelete}
                    className="rounded px-1 text-[var(--dash-text-muted)] hover:text-red-400"
                    aria-label="Delete"
                  >
                    🗑
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
