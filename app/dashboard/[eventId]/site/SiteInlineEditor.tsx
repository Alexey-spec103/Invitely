"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeProvider from "@/components/theme/ThemeProvider";
import { HeroSection } from "@/components/sections/HeroSection";
import type { HeroVariant } from "@/components/sections/HeroSection";
import { LetterSection } from "@/components/sections/LetterSection";
import type { LetterVariant } from "@/components/sections/LetterSection";
import { TimelineSection } from "@/components/sections/TimelineSection";
import type { TimelineVariant, TimelineEvent } from "@/components/sections/TimelineSection";
import { MapSection } from "@/components/sections/MapSection";
import type { MapVariant, MapVenue } from "@/components/sections/MapSection";
import { RsvpSection } from "@/components/sections/RsvpSection";
import type { RsvpQuestion } from "@/components/sections/RsvpSection";
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
  toggleSection,
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
}

interface TimelineDraft {
  title: string;
  events: TimelineEvent[];
  styleOverrides?: StyleOverrides;
}

interface MapDraft {
  title: string;
  venues: MapVenue[];
  styleOverrides?: StyleOverrides;
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
}

interface CountdownDraft {
  title: string;
  styleOverrides?: StyleOverrides;
}

interface GiftDraft {
  title: string;
  description: string;
  styleOverrides?: StyleOverrides;
}

interface DressCodeDraft {
  title: string;
  description: string;
  colors: DressCodeColor[];
  styleOverrides?: StyleOverrides;
}

interface GuestbookDraft {
  title: string;
  styleOverrides?: StyleOverrides;
}

interface VideoDraft {
  title: string;
  videoUrl: string;
  styleOverrides?: StyleOverrides;
}

interface BanquetNavigatorDraft {
  title: string;
  description: string;
  styleOverrides?: StyleOverrides;
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

/** Draft + selection + a simple linear undo/redo stack for one section --
 * shared shape across Letter/Timeline/Map (Hero is handled separately below
 * since its text fields route to a different table/action than its style
 * overrides do). Strictly better than weddingpost.ru's own plain-browser
 * contentEditable undo (confirmed live, this session, to be per-keystroke
 * and app-unaware) -- this is a real app-level snapshot stack, the same
 * pattern already proven in CanvasEditor's history/historyIndex. */
function useEditableSection<T extends { styleOverrides?: StyleOverrides }>(
  initial: T,
  save: (value: T) => Promise<void>
) {
  const [draft, setDraft] = useState<T>(initial);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const historyRef = useRef<T[]>([initial]);
  const historyIndexRef = useRef(0);

  const pushHistory = useCallback((next: T) => {
    const truncated = historyRef.current.slice(0, historyIndexRef.current + 1);
    truncated.push(next);
    historyRef.current = truncated;
    historyIndexRef.current = truncated.length - 1;
  }, []);

  const commitText = useCallback(
    (field: string, value: string) => {
      setDraft((prev) => {
        const next = setFieldValue(prev, field, value);
        pushHistory(next);
        return next;
      });
    },
    [pushHistory]
  );

  const commitStyle = useCallback(
    (field: string, patch: TextStyleOverride | null) => {
      setDraft((prev) => {
        const next = setStyleOverride(prev, field, patch);
        pushHistory(next);
        return next;
      });
    },
    [pushHistory]
  );

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    setDraft(historyRef.current[historyIndexRef.current]);
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    setDraft(historyRef.current[historyIndexRef.current]);
  }, []);

  const { state, error } = useAutosave(draft, save);

  return { draft, setDraft, selectedField, setSelectedField, commitText, commitStyle, undo, redo, state, error };
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
async function previewOnlySubmit(): Promise<never> {
  throw new Error("This is a preview — guests submit RSVPs from your live site, not from here.");
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
}: SiteInlineEditorProps) {
  const router = useRouter();
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
  const [heroSelectedField, setHeroSelectedField] = useState<string | null>(null);

  const { state: weddingDataState, error: weddingDataError } = useAutosave(weddingDataDraft, async (value) => {
    await updateWeddingData({ eventId, ...value });
    router.refresh();
  });
  const { state: heroState, error: heroError } = useAutosave(
    { photoUrl: heroPhoto, styleOverrides: heroOverrides },
    async (value) => {
      await updateHeroSection({ eventId, heroVariant, photoUrl: value.photoUrl, styleOverrides: value.styleOverrides });
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
    await updateLetterSection({ eventId, letterVariant: letter.variant, ...value });
    router.refresh();
  });
  const timelineField = useEditableSection<TimelineDraft>(timeline.values, async (value) => {
    await updateTimelineSection({
      eventId,
      timelineVariant: timeline.variant,
      ...value,
      events: value.events.map((event) => ({ ...event, description: event.description ?? "" })),
    });
    router.refresh();
  });
  const mapField = useEditableSection<MapDraft>(map.values, async (value) => {
    await updateMapSection({ eventId, mapVariant: map.variant, ...value });
    router.refresh();
  });
  const rsvpField = useEditableSection<RsvpDraft>(rsvp.values, async (value) => {
    await updateRsvpSection({ eventId, ...value });
    router.refresh();
  });
  const countdownField = useEditableSection<CountdownDraft>(countdown.values, async (value) => {
    await updateCountdownSection({ eventId, countdownVariant: countdown.variant, ...value });
    router.refresh();
  });
  const giftField = useEditableSection<GiftDraft>(gift.values, async (value) => {
    await updateGiftWishesSection({ eventId, giftVariant: gift.variant, ...value });
    router.refresh();
  });
  const dressCodeField = useEditableSection<DressCodeDraft>(dressCode.values, async (value) => {
    await updateDressCodeSection({ eventId, dressCodeVariant: dressCode.variant, ...value });
    router.refresh();
  });
  const guestbookField = useEditableSection<GuestbookDraft>(guestbook.values, async (value) => {
    await updateGuestbookSection({ eventId, guestbookVariant: guestbook.variant, ...value });
    router.refresh();
  });
  const videoField = useEditableSection<VideoDraft>(video.values, async (value) => {
    await updateVideoSection({ eventId, videoVariant: video.variant, ...value });
    router.refresh();
  });
  const banquetNavigatorField = useEditableSection<BanquetNavigatorDraft>(banquetNavigator.values, async (value) => {
    await updateBanquetNavigatorSection({
      eventId,
      banquetNavigatorVariant: "simple-lookup",
      ...value,
    });
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

  // --- Section enable/disable toggle (Letter/Timeline/Map/RSVP/Countdown/Gift
  // only -- Hero has no toggle, matching today). Optimistic, same pattern as
  // ModuleCard's switch. ---
  const [enabledState, setEnabledState] = useState({
    letter: letter.enabled,
    timeline: timeline.enabled,
    map: map.enabled,
    rsvp: rsvp.enabled,
    countdown: countdown.enabled,
    gift: gift.enabled,
    dressCode: dressCode.enabled,
    guestbook: guestbook.enabled,
    video: video.enabled,
    banquetNavigator: banquetNavigator.enabled,
  });
  const handleToggle = useCallback(
    async (key: SectionKey, next: boolean) => {
      setEnabledState((prev) => ({ ...prev, [key]: next }));
      try {
        await toggleSection(eventId, key, next);
        router.refresh();
      } catch {
        setEnabledState((prev) => ({ ...prev, [key]: !next }));
      }
    },
    [eventId, router]
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

  // Ctrl+Z / Ctrl+Shift+Z, scoped to whichever section currently has a
  // selection (Hero's text has no undo stack of its own -- it's a single
  // field, native contentEditable undo already covers it there).
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "z") return;
      if (!selection || selection.section === "hero") return;
      event.preventDefault();
      const field =
        selection.section === "letter"
          ? letterField
          : selection.section === "timeline"
            ? timelineField
            : selection.section === "map"
              ? mapField
              : selection.section === "rsvp"
                ? rsvpField
                : selection.section === "countdown"
                  ? countdownField
                  : selection.section === "gift"
                    ? giftField
                    : selection.section === "dressCode"
                      ? dressCodeField
                      : selection.section === "guestbook"
                        ? guestbookField
                        : selection.section === "video"
                          ? videoField
                          : banquetNavigatorField;
      if (event.shiftKey) field.redo();
      else field.undo();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    selection,
    letterField,
    timelineField,
    mapField,
    rsvpField,
    countdownField,
    giftField,
    dressCodeField,
    guestbookField,
    videoField,
    banquetNavigatorField,
  ]);

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

  return (
    <div ref={scrollAreaRef} className="relative max-h-[85vh] overflow-y-auto rounded-2xl" onClick={clearSelection}>
      <ThemeProvider theme={theme}>
        <div ref={heroRef}>
          <EditableFieldProvider value={heroContext}>
            <HeroSection variant={heroVariant} names={heroNames} eventDate={weddingDataDraft.eventDate} photoUrl={heroPhoto} styleOverrides={heroOverrides} />
          </EditableFieldProvider>
        </div>

        <SectionHeader label="Hero photo" state={heroState} error={heroError} extra={<AutosaveStatus state={weddingDataState} error={weddingDataError} />} />
        <div className="px-4 pb-4" onClick={(event) => event.stopPropagation()}>
          <PhotoDropzone value={heroPhoto || undefined} onChange={(url) => setHeroPhoto(url ?? "")} mode="upload" label="📷 Photo" />
        </div>

        <SectionHeader
          label={sectionLabels.letter}
          enabled={enabledState.letter}
          onToggle={(next) => handleToggle("letter", next)}
          state={letterField.state}
          error={letterField.error}
        />
        <div ref={letterRef}>
          <EditableFieldProvider value={letterContext}>
            <LetterSection variant={letter.variant} {...letterField.draft} />
          </EditableFieldProvider>
        </div>

        <SectionHeader
          label={sectionLabels.timeline}
          enabled={enabledState.timeline}
          onToggle={(next) => handleToggle("timeline", next)}
          state={timelineField.state}
          error={timelineField.error}
        />
        <div ref={timelineRef}>
          <EditableFieldProvider value={timelineContext}>
            <TimelineSection variant={timeline.variant} {...timelineField.draft} />
          </EditableFieldProvider>
        </div>
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
          enabled={enabledState.map}
          onToggle={(next) => handleToggle("map", next)}
          state={mapField.state}
          error={mapField.error}
        />
        <div ref={mapRef}>
          <EditableFieldProvider value={mapContext}>
            <MapSection variant={map.variant} {...mapField.draft} />
          </EditableFieldProvider>
        </div>
        <div className="flex justify-center pb-6" onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            onClick={() =>
              mapField.setDraft((prev) => ({ ...prev, venues: [...prev.venues, { name: "New venue", address: "" }] }))
            }
            className="dash-btn dash-btn-neutral text-xs"
          >
            + Add venue
          </button>
        </div>

        <SectionHeader
          label={sectionLabels.rsvp}
          enabled={enabledState.rsvp}
          onToggle={(next) => handleToggle("rsvp", next)}
          state={rsvpField.state}
          error={rsvpField.error}
        />
        <div ref={rsvpRef}>
          <EditableFieldProvider value={rsvpContext}>
            <RsvpSection
              variant="simple-form"
              title={rsvpField.draft.title}
              description={rsvpField.draft.description}
              styleOverrides={rsvpField.draft.styleOverrides}
              questions={rsvpQuestionsForRender(rsvpField.draft.questions)}
              onSubmit={previewOnlySubmit}
            />
          </EditableFieldProvider>
        </div>
        <div className="px-4 pb-6" onClick={(event) => event.stopPropagation()}>
          <RsvpQuestionsManager
            questions={rsvpField.draft.questions}
            onChange={(questions) => rsvpField.setDraft((prev) => ({ ...prev, questions }))}
          />
        </div>

        <SectionHeader
          label={sectionLabels.countdown}
          enabled={enabledState.countdown}
          onToggle={(next) => handleToggle("countdown", next)}
          state={countdownField.state}
          error={countdownField.error}
        />
        <div ref={countdownRef}>
          <EditableFieldProvider value={countdownContext}>
            <CountdownSection
              variant={countdown.variant}
              title={countdownField.draft.title}
              eventDateTime={`${weddingDataDraft.eventDate}T00:00:00`}
              styleOverrides={countdownField.draft.styleOverrides}
            />
          </EditableFieldProvider>
        </div>

        <SectionHeader
          label={sectionLabels.gift}
          enabled={enabledState.gift}
          onToggle={(next) => handleToggle("gift", next)}
          state={giftField.state}
          error={giftField.error}
        />
        <div ref={giftRef}>
          <EditableFieldProvider value={giftContext}>
            <GiftSection
              variant={gift.variant}
              title={giftField.draft.title}
              description={giftField.draft.description}
              styleOverrides={giftField.draft.styleOverrides}
              preferences={giftPreferencesForRender(gift.preferences)}
            />
          </EditableFieldProvider>
        </div>
        <div className="px-4 pb-6" onClick={(event) => event.stopPropagation()}>
          <GiftWishesManager eventId={eventId} preferences={gift.preferences} />
        </div>

        <SectionHeader
          label={sectionLabels.dressCode}
          enabled={enabledState.dressCode}
          onToggle={(next) => handleToggle("dressCode", next)}
          state={dressCodeField.state}
          error={dressCodeField.error}
        />
        <div ref={dressCodeRef}>
          <EditableFieldProvider value={dressCodeContext}>
            <DressCodeSection
              variant={dressCode.variant}
              title={dressCodeField.draft.title}
              description={dressCodeField.draft.description}
              colors={dressCodeField.draft.colors}
              styleOverrides={dressCodeField.draft.styleOverrides}
            />
          </EditableFieldProvider>
        </div>
        <div className="px-4 pb-6" onClick={(event) => event.stopPropagation()}>
          <DressCodeColorsManager
            colors={dressCodeField.draft.colors}
            onChange={(colors) => dressCodeField.setDraft((prev) => ({ ...prev, colors }))}
          />
        </div>

        <SectionHeader
          label={sectionLabels.guestbook}
          enabled={enabledState.guestbook}
          onToggle={(next) => handleToggle("guestbook", next)}
          state={guestbookField.state}
          error={guestbookField.error}
        />
        <div ref={guestbookRef}>
          <EditableFieldProvider value={guestbookContext}>
            <GuestbookSection
              variant={guestbook.variant}
              title={guestbookField.draft.title}
              styleOverrides={guestbookField.draft.styleOverrides}
              messages={guestbook.messages}
            />
          </EditableFieldProvider>
        </div>
        <div className="px-4 pb-6 text-xs text-[var(--dash-text-muted)]" onClick={(event) => event.stopPropagation()}>
          Messages come from guests&apos; RSVP comments. Hide or show individual messages from the Guests tab.
        </div>

        <SectionHeader
          label={sectionLabels.video}
          enabled={enabledState.video}
          onToggle={(next) => handleToggle("video", next)}
          state={videoField.state}
          error={videoField.error}
        />
        <div ref={videoRef}>
          <EditableFieldProvider value={videoContext}>
            <VideoSection
              variant={video.variant}
              title={videoField.draft.title}
              videoUrl={videoField.draft.videoUrl}
              styleOverrides={videoField.draft.styleOverrides}
            />
          </EditableFieldProvider>
        </div>
        <div className="px-4 pb-6" onClick={(event) => event.stopPropagation()}>
          <VideoUrlManager
            videoUrl={videoField.draft.videoUrl}
            onChange={(videoUrl) => videoField.setDraft((prev) => ({ ...prev, videoUrl }))}
          />
        </div>

        <SectionHeader
          label={banquetNavigator.seatingLabel}
          enabled={enabledState.banquetNavigator}
          onToggle={(next) => handleToggle("banquetNavigator", next)}
          state={banquetNavigatorField.state}
          error={banquetNavigatorField.error}
        />
        <div ref={banquetNavigatorRef}>
          <EditableFieldProvider value={banquetNavigatorContext}>
            <BanquetNavigatorSection
              variant="simple-lookup"
              title={banquetNavigatorField.draft.title}
              description={banquetNavigatorField.draft.description}
              styleOverrides={banquetNavigatorField.draft.styleOverrides}
              onLookup={previewOnlyLookup}
            />
          </EditableFieldProvider>
        </div>
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

function SectionHeader({
  label,
  enabled,
  onToggle,
  state,
  error,
  extra,
}: {
  label: string;
  enabled?: boolean;
  onToggle?: (next: boolean) => void;
  state: AutosaveState;
  error: string | null;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-t border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 py-2">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-text-muted)]">{label}</span>
        {onToggle && (
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={(event) => {
              event.stopPropagation();
              onToggle(!enabled);
            }}
            className={`relative h-4 w-7 shrink-0 rounded-full transition ${enabled ? "bg-[var(--dash-accent)]" : "bg-[var(--dash-border)]"}`}
          >
            <span
              className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition ${enabled ? "left-3.5" : "left-0.5"}`}
            />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {extra}
        <AutosaveStatus state={state} error={error} />
      </div>
    </div>
  );
}
