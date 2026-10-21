"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { Sparkles, Heart } from "lucide-react";
import ThemeProvider from "@/components/theme/ThemeProvider";
import {
  THEME_SEASONS,
  layoutLabelFor,
  POPULAR_THEME_IDS,
  NEW_THEME_IDS,
} from "@/lib/themes";
import type { Theme, ThemeCategory, ThemeSeason } from "@/lib/themes";
import type { EventTypeId } from "@/lib/eventTypes";
import { OCCASION_CATEGORIES } from "@/lib/themes/occasionCategories";
import { useFavoriteThemes } from "@/lib/useFavoriteThemes";
import { effectiveDecorCategory } from "@/lib/themes/decorMotifs";
import { CATEGORY_STYLE_ICONS, LAYOUT_STYLE_ICONS } from "@/components/icons/StyleFilterIcons";
import { recommendedHeroVariantFor, PHOTO_PROMINENT_HERO_VARIANTS } from "@/lib/themes/recommendedHeroVariant";
import { highlightFeaturesFor } from "@/lib/themes/highlightFeatures";
import { HeroSection, HERO_VARIANTS, DEFAULT_HERO_VARIANT } from "@/components/sections/HeroSection";
import type { HeroVariant } from "@/components/sections/HeroSection";
import { LetterSection } from "@/components/sections/LetterSection";
import { TimelineSection } from "@/components/sections/TimelineSection";
import type { Locale } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocalizedEventTypeList } from "@/lib/eventTypesLocalized";
import {
  previewPhotoFor,
  previewNamesFor,
  previewTargetDateFor,
  previewQuoteFor,
  formatPreviewDate,
} from "@/lib/themes/previewMedia";
import { getCountdownParts, type CountdownParts } from "@/lib/countdown";
import styles from "./ThemeGallery.module.css";

/** Where a Hero variant's real content sits inside its min-height:100vh
 * section -- decides how far the phone-mockup's crop window has to shift to
 * bring that content into view instead of showing empty top-of-page padding
 * (see `.phoneScaleInner` in the CSS module). Most variants center their
 * content; a few anchor it to the bottom by design (PhotoFullBleed's caption
 * over the foot of the photo, EditorialMinimal/BohoAsymmetric's bottom-
 * weighted composition); Stacked Grid spreads two names across the full page
 * height (Priority 5) and can't be fixed by any single crop. */
const BOTTOM_ANCHORED_VARIANTS = new Set<HeroVariant>(["editorial-minimal", "boho-asymmetric", "photo-full-bleed"]);
const SPREAD_VARIANTS = new Set<HeroVariant>(["stacked-grid"]);

function anchorFor(variant: HeroVariant): "center" | "bottom" | "spread" {
  if (SPREAD_VARIANTS.has(variant)) return "spread";
  if (BOTTOM_ANCHORED_VARIANTS.has(variant)) return "bottom";
  return "center";
}

/** Resting translateY per anchor, one table per mockup aspect -- lifted out
 * of the CSS module (where they used to live as the only values) so the
 * drag hook below can read the same numbers JS needs for its math. Keep
 * these in sync with .desktopScaleInner/.phoneScaleInner's own per-anchor
 * rules in ThemeGallery.module.css if either ever changes. */
const DESKTOP_REST_VH: Record<"center" | "bottom" | "spread", number> = {
  center: -30,
  bottom: -58,
  spread: 0,
};
const PHONE_REST_VH: Record<"center" | "bottom" | "spread", number> = {
  center: -38,
  bottom: -68,
  spread: 0,
};
/** How far a drag can reveal -- shared across every anchor (not anchor-
 * relative, same as the old theme-card-pan keyframe's single end point):
 * this is a property of the stacked Hero+Letter+Timeline content's own
 * height, not of where any one Hero variant's content happens to sit.
 * Checked empirically against the rendered DOM (see theme-card-pan's own
 * comment in the CSS module for the same number and the reasoning) --
 * -250vh ran past Timeline's own 3-event list into its trailing section
 * padding (confirmed live via the phone mockup), so this stops short of
 * that at -205vh instead. */
const DEEP_PAN_VH = -205;

/** Real pointer-drag panning for a theme card's miniature site preview --
 * lets a shopper grab the mockup and drag it like a tall photo in a small
 * frame, instead of only ever seeing one fixed crop or a canned auto-pan.
 * `wrapRef` is owned by the caller (not created in here) and must point at
 * the frame element whose own rendered width stands in for `100cqw` (the
 * scale factor `.desktopScaleInner`/`.phoneScaleInner` already use) --
 * `.desktopPanel`/`.phoneMockup` themselves, not their
 * (pointer-events:none) scale-wrap children, since this hook needs real
 * pointer events to reach it. Taking the ref as a parameter instead of
 * returning one keeps this hook's return value plain reactive state --
 * bundling a ref object into the same returned value as `pan`/`dragging`
 * trips eslint-plugin-react-hooks's `refs` rule, which can't prove property
 * reads off that object aren't `.current` reads during render. `onDragStart`
 * fires once per gesture, the first time movement crosses the drag
 * threshold -- the card's own onClick uses this to tell an actual tap
 * (select this theme) apart from the start of a drag (pan, don't select). */
function useDragPan(
  wrapRef: RefObject<HTMLDivElement | null>,
  restVh: number,
  deepVh: number,
  onDragStart: () => void,
) {
  const [pan, setPan] = useState(restVh);
  const panRef = useRef(restVh);
  const dragRef = useRef<{ pointerId: number; startY: number; startPan: number; dragged: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);

  // Wheel needs the current pan synchronously, outside React's render cycle
  // (see the native listener below) -- a plain ref kept in lockstep with
  // the state avoids re-subscribing that listener on every scroll tick just
  // to close over a fresh `pan`.
  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  // The rest position changes whenever a different theme (different anchor)
  // is scrolled into view under the same mounted card -- keeps a card that
  // isn't currently being dragged following its own theme's resting crop
  // instead of freezing at whatever the previous theme's anchor happened to
  // leave it at.
  useEffect(() => {
    if (!dragRef.current) setPan(restVh);
  }, [restVh]);

  // Mouse-wheel scrolling -- the actual, discoverable gesture most people
  // reach for first (confirmed: drag-to-pan alone wasn't found by the
  // product owner testing live; hovering used to auto-pan before drag
  // replaced it, so landing on a card with neither a visible hint nor a
  // response to the ordinary wheel gesture read as "the preview's broken").
  // A native, non-passive listener, not React's onWheel -- React (18+)
  // attaches wheel listeners as passive by default, so event.preventDefault
  // inside a JSX onWheel handler silently fails to stop the page scrolling
  // underneath the card. Boundary-aware: only preventDefault (and consume
  // the scroll) while the pan still has room to move in that direction --
  // once a card is scrolled to either end, further wheel input in that same
  // direction passes through untouched so the surrounding gallery page
  // keeps scrolling normally instead of feeling stuck under the cursor.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const onWheel = (event: WheelEvent) => {
      const atRest = panRef.current >= restVh;
      const atDeepEnd = panRef.current <= deepVh;
      if ((event.deltaY < 0 && atRest) || (event.deltaY > 0 && atDeepEnd)) return;
      event.preventDefault();
      const scale = wrap.clientWidth / 375;
      if (scale <= 0) return;
      const deltaVh = (event.deltaY * 100) / (scale * window.innerHeight);
      const next = Math.min(restVh, Math.max(deepVh, panRef.current - deltaVh));
      setPan(next);
    };
    wrap.addEventListener("wheel", onWheel, { passive: false });
    return () => wrap.removeEventListener("wheel", onWheel);
  }, [wrapRef, restVh, deepVh]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragRef.current = { pointerId: event.pointerId, startY: event.clientY, startPan: pan, dragged: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaY = event.clientY - drag.startY;
    if (!drag.dragged) {
      if (Math.abs(deltaY) < 4) return;
      drag.dragged = true;
      setDragging(true);
      onDragStart();
    }
    const wrap = wrapRef.current;
    if (!wrap || typeof window === "undefined") return;
    const scale = wrap.clientWidth / 375;
    if (scale <= 0) return;
    // translateY is in vh (the real document viewport, unaffected by this
    // card's own container-query width) -- convert the on-screen drag
    // distance back into that same unit via the current scale factor.
    const deltaVh = (deltaY * 100) / (scale * window.innerHeight);
    const next = Math.min(restVh, Math.max(deepVh, drag.startPan + deltaVh));
    setPan(next);
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (!drag.dragged) {
      // No pointermove ever crossed the threshold -- can happen when the
      // browser (or a very fast real flick) never dispatches an
      // intermediate move event between pointerdown and pointerup, so
      // onPointerMove's own threshold check above never got a chance to
      // run. Confirmed live: a synthetic drag landing pointerup far from
      // pointerdown with zero moves in between fell through to the card's
      // onClick and silently selected the theme instead of panning it.
      // Falling back to total displacement here catches that case too.
      const deltaY = event.clientY - drag.startY;
      if (Math.abs(deltaY) >= 4) {
        onDragStart();
        const wrap = wrapRef.current;
        if (wrap && typeof window !== "undefined") {
          const scale = wrap.clientWidth / 375;
          if (scale > 0) {
            const deltaVh = (deltaY * 100) / (scale * window.innerHeight);
            setPan(Math.min(restVh, Math.max(deepVh, drag.startPan + deltaVh)));
          }
        }
      }
    }
    dragRef.current = null;
    setDragging(false);
  };

  // Deliberately no reset-on-pointerleave: a drag should behave like panning
  // a real photo -- it stays wherever you left it, not snap back the moment
  // your cursor drifts off the card (which it very often does right at the
  // end of an ordinary drag-and-release gesture). `onPointerCancel` already
  // covers a drag interrupted mid-gesture (e.g. the browser taking over for
  // a system gesture); a plain pointerleave during an active drag doesn't
  // end it at all since this element holds pointer capture, so move/up
  // events keep arriving here regardless of where the cursor physically is.

  return {
    pan,
    dragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
}

const PAGE_SIZE = 24;

interface ThemeGalleryProps {
  themes: Theme[];
  selectedId?: string;
  onSelect: (themeId: string) => void;
  disabled?: boolean;
  /** dashboard-audit.md A6 -- see `ThemeGalleryCardProps.onCustomize`. */
  onCustomize?: () => void;
  /** The event's own type (lib/eventTypes.ts id), when the caller knows it
   * -- drives the "Occasion" chip row below and its default selection. Not
   * every caller has this yet (e.g. a hypothetical theme-only context), so
   * it's optional and the row simply doesn't render without it. */
  eventType?: string;
  /** Optional, defaulting to English -- same convention as ModuleCard/
   * FirstVisitTour, so the several not-yet-updated callers (onboarding
   * wizard, marketing landing page's `LandingThemeShowcase`) keep working
   * unchanged until their own locale-threading lands. */
  locale?: Locale;
}

/** Category/season sidebar + search + a live, screenshot-free dual mockup
 * per card (invitation-card preview stacked on a simplified site strip) --
 * mirrors weddingpost.ru's gallery framing without copying any of their
 * actual artwork. Reused as-is across dashboard, onboarding, and (later)
 * the public landing page: this component only ever reports an id via
 * `onSelect`, the caller decides what that means (save, form field, or a
 * `?theme=` link). */
type EntryId = "popular" | "new" | "favorites";

/** dashboard-audit.md B7: STYLE (theme.category, exactly 10 themes in each
 * of 10 buckets -- a designed-even split, not wrong data, confirmed via
 * `grep`) read as synthetic sitting in its own block of ten identical
 * counts. LAYOUT (technique/composition, organic 3-11 counts) was already
 * "done right" per the audit. Merging them into one taxonomy -- exactly the
 * alternative the audit itself offers -- doesn't touch `theme.category`
 * (still load-bearing for preview photos/Hero variants elsewhere), only how
 * the sidebar presents it: as one flat, count-sorted list instead of two
 * separate blocks, so a handful of "10"s land interspersed among varied
 * numbers instead of forming an all-identical block on their own. */
type StyleValue = { kind: "category"; id: ThemeCategory } | { kind: "layout"; id: string };
type StyleEntry = StyleValue & { label: string; count: number };

export default function ThemeGallery({
  themes,
  selectedId,
  onSelect,
  disabled,
  onCustomize,
  eventType,
  locale,
}: ThemeGalleryProps) {
  const t = getDictionary(locale ?? "en").dashboard.style.gallery;
  const eventTypeList = useMemo(() => getLocalizedEventTypeList(locale ?? "en"), [locale]);
  // dashboard-audit.md B6: weddingpost.ru's catalog opens on its "Популярные"
  // entry rather than an unfiltered "all" -- confirmed live. This is a
  // separate axis from category/season/layout below (an "entry", not a
  // category, per the audit's own wording), so picking one clears the other
  // filters and vice versa rather than trying to combine both at once.
  const [entry, setEntry] = useState<EntryId | null>("popular");
  const [style, setStyle] = useState<StyleValue | null>(null);
  const [season, setSeason] = useState<ThemeSeason | "all">("all");
  // Pre-selected to the event's own type when OCCASION_CATEGORIES has a
  // shortlist for it (not every type does -- "other" deliberately doesn't,
  // see that file's own comment) -- an independent narrowing axis, not
  // mutually exclusive with Popular/category/search the way entry and style
  // are with each other, so "Popular wedding styles" is a real, reachable
  // state rather than forcing a choice between the two.
  const [occasion, setOccasion] = useState<EventTypeId | null>(
    eventType && OCCASION_CATEGORIES[eventType as EventTypeId] ? (eventType as EventTypeId) : null
  );
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { favoriteIds, toggleFavorite } = useFavoriteThemes();
  const currentYear = new Date().getFullYear();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return themes.filter((theme) => {
      if (entry === "popular" && !POPULAR_THEME_IDS.includes(theme.id)) return false;
      if (entry === "new" && !NEW_THEME_IDS.includes(theme.id)) return false;
      if (entry === "favorites" && !favoriteIds.has(theme.id)) return false;
      if (occasion) {
        const allowedCategories = OCCASION_CATEGORIES[occasion];
        if (allowedCategories && !allowedCategories.includes(theme.category)) return false;
      }
      if (style?.kind === "category" && theme.category !== style.id) return false;
      if (style?.kind === "layout" && layoutLabelFor(theme.id, theme.category) !== style.id) return false;
      if (season !== "all" && theme.season !== season) return false;
      if (
        q &&
        !theme.name.toLowerCase().includes(q) &&
        !theme.tags.some((tag) => tag.toLowerCase().includes(q)) &&
        !layoutLabelFor(theme.id, theme.category).toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [themes, entry, favoriteIds, occasion, style, season, query]);

  const visible = filtered.slice(0, visibleCount);

  const selectEntry = (next: EntryId) => {
    setEntry((current) => (current === next ? null : next));
    setVisibleCount(PAGE_SIZE);
  };

  // Deliberately does NOT clear `entry`/`style`/`season` the way those clear
  // each other -- "Popular wedding styles" (entry="popular" AND
  // occasion="wedding" both set) is the actual point of this filter, not an
  // edge case to prevent.
  const updateOccasion = (next: EventTypeId) => {
    setOccasion((current) => (current === next ? null : next));
    setVisibleCount(PAGE_SIZE);
  };

  const updateStyle = (next: StyleValue | null) => {
    setEntry(null);
    setStyle(next);
    setVisibleCount(PAGE_SIZE);
  };

  const updateSeason = (next: ThemeSeason | "all") => {
    setEntry(null);
    setSeason(next);
    setVisibleCount(PAGE_SIZE);
  };

  const updateQuery = (next: string) => {
    setEntry(null);
    setQuery(next);
    setVisibleCount(PAGE_SIZE);
  };

  // dashboard-audit.md follow-up (2026-10-13): THEME_CATEGORIES/THEME_LAYOUTS
  // are global counts across all 124 themes, but OCCASION_CATEGORIES narrows
  // *which themes are reachable at all* once an occasion chip is active (e.g.
  // "Wedding" excludes modern/minimal/coastal/dark/cosmic entirely) -- the
  // sidebar badges didn't know that, so e.g. "Minimal 10" sat there under
  // Wedding and clicking it always landed on "No styles match", a dead end
  // with no indication why. Recomputed from the occasion-scoped theme set
  // (same predicate `filtered` above already applies) instead of the global
  // constants, so a bucket that would be empty under the current occasion is
  // never offered in the first place -- no theme or category definition is
  // touched, this only changes which sidebar chips are shown/counted.
  const occasionThemes = occasion && OCCASION_CATEGORIES[occasion]
    ? themes.filter((theme) => OCCASION_CATEGORIES[occasion]!.includes(theme.category))
    : themes;
  const categoryCounts = occasionThemes.reduce((counts, theme) => {
    counts[theme.category] = (counts[theme.category] ?? 0) + 1;
    return counts;
  }, {} as Record<ThemeCategory, number>);
  const layoutCounts = occasionThemes.reduce((counts, theme) => {
    const label = layoutLabelFor(theme.id, theme.category);
    counts[label] = (counts[label] ?? 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  const categoryEntries = Object.entries(categoryCounts) as [ThemeCategory, number][];
  const seasonEntries = Object.entries(THEME_SEASONS) as [ThemeSeason, number][];
  const layoutEntries = Object.entries(layoutCounts).sort((a, b) => b[1] - a[1]);
  // Below this, a layout bucket (e.g. "Alcohol Ink" at 1 theme, "Gothic
  // Frame" at 2) reads as a near-empty dead end in the sidebar rather than a
  // useful way to browse -- confirmed live, 11 of 34 combined buckets had
  // fewer than 4 themes. The themes themselves aren't hidden: they still
  // show up under their (always >=6) base category and in search, this just
  // keeps the filter list itself from padding out with sparse entries.
  const MIN_STYLE_BUCKET_SIZE = 4;
  const combinedStyleEntries: StyleEntry[] = [
    ...categoryEntries
      .filter(([, count]) => count > 0)
      .map(([cat, count]) => ({ kind: "category" as const, id: cat, label: t.categories[cat], count })),
    ...layoutEntries
      .filter(([, count]) => count >= MIN_STYLE_BUCKET_SIZE)
      .map(([label, count]) => ({ kind: "layout" as const, id: label, label, count })),
  ].sort((a, b) => b.count - a.count);

  return (
    <div className={styles.root}>
    {eventType && (
      <div className={styles.occasionRow}>
        {eventTypeList.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => updateOccasion(type.id)}
            className={occasion === type.id ? styles.occasionChipActive : styles.occasionChip}
          >
            {type.label}
          </button>
        ))}
      </div>
    )}
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <input
          type="search"
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          placeholder={t.searchPlaceholder}
          className={styles.search}
        />

        <div className={styles.filterGroup}>
          <button
            type="button"
            onClick={() => selectEntry("popular")}
            className={entry === "popular" ? styles.filterActive : styles.filterBtn}
          >
            <span className={styles.entryLabel}>
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {t.popular}
            </span>
            <span className={styles.count}>{POPULAR_THEME_IDS.length}</span>
          </button>
          <button
            type="button"
            onClick={() => selectEntry("new")}
            className={entry === "new" ? styles.filterActive : styles.filterBtn}
          >
            <span>{t.new}</span>
            <span className={styles.newBadge}>{t.new.toUpperCase()}</span>
          </button>
          {seasonEntries.map(([s]) => (
            <button
              key={`entry-${s}`}
              type="button"
              onClick={() => updateSeason(season === s && entry === null ? "all" : s)}
              className={entry === null && season === s ? styles.filterActive : styles.filterBtn}
            >
              <span>{t.seasonYear(t.seasons[s], currentYear)}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => selectEntry("favorites")}
            className={entry === "favorites" ? styles.filterActive : styles.filterBtn}
          >
            <span className={styles.entryLabel}>
              <Heart className="h-3.5 w-3.5" aria-hidden="true" />
              {t.favorites}
            </span>
            <span className={styles.count}>{favoriteIds.size}</span>
          </button>
        </div>

        <hr className={styles.entriesDivider} />

        <div className={styles.filterGroup}>
          {/* 2026-10-17 design pass: direct product-owner feedback -- once
              "Popular" is elevated into its own headline treatment above the
              grid (see .gallery below), it must stay obvious a host isn't
              limited to those 14 picks. A plain "Style" label reads as pure
              UI chrome (a filter's name, same register as "Season" below
              it) rather than an invitation to keep looking -- this one
              phrasing change is what actually answers "can I pick something
              else?" without touching layout or hiding anything. */}
          <p className={styles.filterLabel}>{t.orPickSpecific}</p>
          <button
            type="button"
            onClick={() => updateStyle(null)}
            className={style === null ? styles.filterActive : styles.filterBtn}
          >
            <span>{t.allStyles}</span>
            <span className={styles.count}>{themes.length}</span>
          </button>
          {combinedStyleEntries.map((item) => {
            const Icon = item.kind === "category" ? CATEGORY_STYLE_ICONS[item.id] : LAYOUT_STYLE_ICONS[item.id];
            return (
              <button
                key={`${item.kind}-${item.id}`}
                type="button"
                onClick={() => updateStyle(style?.kind === item.kind && style.id === item.id ? null : item)}
                className={style?.kind === item.kind && style.id === item.id ? styles.filterActive : styles.filterBtn}
              >
                <span className={styles.entryLabel}>
                  {Icon && <Icon className={styles.styleIcon} />}
                  {item.label}
                </span>
                <span className={styles.count}>{item.count}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.filterGroup}>
          <p className={styles.filterLabel}>{t.season}</p>
          <button
            type="button"
            onClick={() => updateSeason("all")}
            className={season === "all" ? styles.filterActive : styles.filterBtn}
          >
            <span>{t.allYear}</span>
          </button>
          {seasonEntries.map(([s, count]) => (
            <button
              key={s}
              type="button"
              onClick={() => updateSeason(s)}
              className={season === s ? styles.filterActive : styles.filterBtn}
            >
              <span>{t.seasons[s]}</span>
              <span className={styles.count}>{count}</span>
            </button>
          ))}
        </div>
      </aside>

      <div className={styles.gallery}>
        {/* 2026-10-17 design pass: direct product-owner feedback -- "Popular"
            used to be visually identical to every other sidebar filter (a
            quiet text button with a count badge), so a first-time visitor's
            very first impression of the catalog carried no signal that
            these 14 are a deliberate, hand-picked best-of (see
            lib/themes/index.ts's own POPULAR_THEME_IDS comment -- they
            already are, curated across every category specifically so this
            moment wouldn't read as one narrow mood). A real headline + a
            warm panel behind it is what actually sells "these are our
            favorites," not the filter mechanism alone. The second line
            doubles as the answer to "can I see something else" -- same
            fix as the sidebar's own relabeled "Or pick a specific style"
            just above, stated plainly instead of relying on the sidebar
            being noticed. Scoped to the *pure* Popular view only (entry ===
            "popular", no search/style/season narrowing it further, which
            the existing state model already guarantees are mutually
            exclusive) -- every other filtered view keeps the plain count
            line, unchanged. */}
        {entry === "popular" ? (
          <div className={styles.popularHeading}>
            <p className={styles.popularTitle}>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {t.favoriteTitle}
            </p>
            <p className={styles.popularSubtext}>{t.favoriteSubtext}</p>
          </div>
        ) : (
          <p className={styles.resultsCount}>
            {t.resultsCount(filtered.length)}
            <span className={styles.hoverHint}>{t.hoverHint}</span>
          </p>
        )}
        <div className={entry === "popular" ? `${styles.grid} ${styles.gridPopular}` : styles.grid}>
          {visible.map((theme) => (
            <ThemeGalleryCard
              key={theme.id}
              theme={theme}
              selected={theme.id === selectedId}
              disabled={disabled}
              onSelect={onSelect}
              onCustomize={onCustomize}
              isFavorite={favoriteIds.has(theme.id)}
              onToggleFavorite={toggleFavorite}
              locale={locale}
            />
          ))}
        </div>
        {filtered.length === 0 && <p className={styles.empty}>{t.noMatch}</p>}
        {visibleCount < filtered.length && (
          <button
            type="button"
            className={styles.showMore}
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            {t.showMore(filtered.length - visibleCount)}
          </button>
        )}
      </div>
    </div>
    </div>
  );
}

export interface ThemeGalleryCardProps {
  theme: Theme;
  selected: boolean;
  disabled?: boolean;
  onSelect: (themeId: string) => void;
  /** dashboard-audit.md A6: weddingpost.ru's own already-selected card has no
   * hover button at all (just a permanent "✓ Выбранный вариант" banner,
   * confirmed live) -- their hover-reveal "Настроить" only exists on OTHER
   * cards, and both selects and opens the editor in one click. We have a
   * separate Site tab to send a host to instead, so this is the adapted
   * equivalent for a card that's already selected: hover reveals "Customize
   * →", which jumps straight there. Only passed by the dashboard's own
   * `ThemeSelectForm` (there's no site to customize yet in onboarding, and
   * no signed-in event at all on the marketing landing page) -- omitted
   * elsewhere, the already-selected card just shows no hover affordance,
   * same as before this change. */
  onCustomize?: () => void;
  /** dashboard-audit.md B6/B9: only passed by the full `ThemeGallery` (not
   * `LandingThemeShowcase`'s bare reuse) -- omitted, the heart just doesn't
   * render, same optional-prop convention as `onCustomize` above. */
  isFavorite?: boolean;
  onToggleFavorite?: (themeId: string) => void;
  /** Optional, defaulting to English -- same convention as `ThemeGallery`
   * itself (see that prop's own comment). */
  locale?: Locale;
}

/** Exported so `LandingThemeShowcase` (the trimmed, no-filters 6-card
 * teaser on the public landing page) can reuse the exact same card --
 * phone-mockup rendering, crop-fix, marketing chrome, all of it -- instead
 * of forking a second copy that would drift out of sync. */
export function ThemeGalleryCard({
  theme,
  selected,
  disabled,
  onSelect,
  onCustomize,
  isFavorite,
  onToggleFavorite,
  locale,
}: ThemeGalleryCardProps) {
  const resolvedLocale = locale ?? "en";
  const t = getDictionary(resolvedLocale).dashboard.style.card;
  // Demo-only schedule, same register as the Letter preview copy below --
  // a believable sample, never meant to look like real event data.
  const previewTimelineEvents = [
    { time: "4:00 PM", title: t.timelineCeremony },
    { time: "5:00 PM", title: t.timelineCocktail },
    { time: "6:30 PM", title: t.timelineReception },
  ];
  const [name1, name2] = previewNamesFor(theme.id);
  const photoUrl = `${previewPhotoFor(theme.id, theme.category)}?w=500&q=70&fit=crop&auto=format`;
  const targetDate = useMemo(() => previewTargetDateFor(theme.id, theme.season), [theme.id, theme.season]);
  const dateLabel = formatPreviewDate(targetDate);
  const layoutLabel = layoutLabelFor(theme.id, theme.category);
  const tags = [layoutLabel, ...theme.tags.filter((tag) => tag !== layoutLabel)].slice(0, 4);
  const highlightFeatures = highlightFeaturesFor(theme.category);
  const recommendedVariant = recommendedHeroVariantFor(theme.id, theme.category);
  const heroVariant: HeroVariant = HERO_VARIANTS.includes(recommendedVariant as HeroVariant)
    ? (recommendedVariant as HeroVariant)
    : DEFAULT_HERO_VARIANT;
  const anchor = anchorFor(heroVariant);

  // Shared between both mockups' drag hooks below: a tap that turns into a
  // drag must not also select the theme once the pointer lifts -- set the
  // instant either hook's gesture crosses the drag threshold, read (and
  // cleared) by this button's own onClick.
  const justDraggedRef = useRef(false);
  const markDragged = () => {
    justDraggedRef.current = true;
  };
  const desktopWrapRef = useRef<HTMLDivElement | null>(null);
  const phoneWrapRef = useRef<HTMLDivElement | null>(null);
  const desktopDrag = useDragPan(desktopWrapRef, DESKTOP_REST_VH[anchor], DEEP_PAN_VH, markDragged);
  const phoneDrag = useDragPan(phoneWrapRef, PHONE_REST_VH[anchor], DEEP_PAN_VH, markDragged);

  // Second, independent guard against the same "drag mis-fires as a click"
  // problem -- confirmed live: a fast/synthetic drag can deliver pointerdown
  // and pointerup with a different `pointerId` on each (observed from
  // automated drag input; plausibly also a real trackpad/stylus in some
  // browsers), which makes useDragPan's own pointerId-matched handlers
  // silently no-op on pointerup, so `justDraggedRef` never gets set even
  // though the pointer travelled well past the drag threshold. This capture-
  // phase listener records a raw down-position independent of pointerId or
  // which inner mockup was touched, so the click handler below can compare
  // against it directly as a fallback -- belt-and-suspenders with
  // `justDraggedRef`, not a replacement for it (that one still drives the
  // pan itself).
  const cardPointerDownRef = useRef<{ x: number; y: number } | null>(null);
  const onCardPointerDownCapture = (event: ReactPointerEvent<HTMLButtonElement>) => {
    cardPointerDownRef.current = { x: event.clientX, y: event.clientY };
  };
  const wasRealClick = (event: MouseEvent<HTMLButtonElement>) => {
    const down = cardPointerDownRef.current;
    cardPointerDownRef.current = null;
    if (!down) return true;
    const dx = event.clientX - down.x;
    const dy = event.clientY - down.y;
    return Math.sqrt(dx * dx + dy * dy) < 4;
  };

  // A static snapshot, not a live tick: this is a decorative demo timer, not
  // a real countdown, and up to ~24 cards on screen each running their own
  // setInterval(1000ms) re-render (as the real Countdown section's
  // SimpleDigits.tsx does for a single instance) made the whole grid janky.
  // Null until mount, since a Date.now()-based value computed during the
  // server render would almost always mismatch the client's hydration-time
  // value; deferred via setTimeout rather than called directly in the effect
  // body so the first paint isn't a synchronous cascading render. Shown on
  // every catalog card, not just the marketing landing page's -- confirmed
  // live against weddingpost.ru's own real (logged-in) style catalog, this
  // is standard demo chrome for a theme picker, not something that only
  // belongs on a marketing teaser (dashboard-audit.md A4).
  const [countdown, setCountdown] = useState<CountdownParts | null>(null);
  useEffect(() => {
    const eventDateTime = targetDate.toISOString();
    const timeout = setTimeout(() => setCountdown(getCountdownParts(eventDateTime)), 0);
    return () => clearTimeout(timeout);
  }, [targetDate]);

  // Generated lazily on first hover/focus, not eagerly for all ~24 cards on
  // screen at once -- a shopper browsing the catalog on a laptop scans this
  // to see the theme rendered live on their own phone (app/preview/[themeId])
  // instead of just imagining it from the mockup. `qrcode` is already a
  // project dependency (invite/canvas QR export) and already used this same
  // dynamic-import-then-toDataURL way from a client component (see
  // InvitationDownloads.tsx), so this reuses that exact pattern.
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const qrRequestedRef = useRef(false);
  const requestQrPreview = () => {
    if (qrRequestedRef.current || typeof window === "undefined") return;
    qrRequestedRef.current = true;
    const previewUrl = `${window.location.origin}/preview/${theme.id}`;
    import("qrcode")
      .then(({ default: QRCode }) => QRCode.toDataURL(previewUrl, { margin: 1, width: 160 }))
      .then(setQrDataUrl)
      .catch(() => {
        // Non-fatal -- the corner badge just never appears for this card.
      });
  };

  // A `<span role="button">`, not a nested `<button>` -- the card itself is
  // already a `<button>`, and a button inside a button is invalid HTML (the
  // browser silently hoists/breaks it), so this needs its own keyboard
  // handling to stay a real control instead of just a styled `onClick` div.
  const handleFavoriteClick = (event: MouseEvent) => {
    event.stopPropagation();
    onToggleFavorite?.(theme.id);
  };
  const handleFavoriteKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      onToggleFavorite?.(theme.id);
    }
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDownCapture={onCardPointerDownCapture}
      onClick={(event) => {
        const draggedFlag = justDraggedRef.current;
        justDraggedRef.current = false;
        if (draggedFlag || !wasRealClick(event)) return;
        if (selected && onCustomize) onCustomize();
        else onSelect(theme.id);
      }}
      onMouseEnter={requestQrPreview}
      onFocus={requestQrPreview}
      className={selected ? styles.cardSelected : styles.card}
    >
      <ThemeProvider theme={theme}>
        <div className={styles.duoMockup}>
          {qrDataUrl && (
            <div className={styles.qrReveal} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="" className={styles.qrImage} />
              <span className={styles.qrCaption}>{t.scanToPreview}</span>
            </div>
          )}
          {onToggleFavorite && (
            <span
              role="button"
              tabIndex={0}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? t.removeFavorite : t.addFavorite}
              onClick={handleFavoriteClick}
              onKeyDown={handleFavoriteKeyDown}
              className={styles.favoriteHeart}
            >
              <Heart className="h-[18px] w-[18px]" fill={isFavorite ? "currentColor" : "none"} aria-hidden="true" />
            </span>
          )}
          <div
            ref={desktopWrapRef}
            className={styles.desktopPanel}
            data-dragging={desktopDrag.dragging || undefined}
            {...desktopDrag.handlers}
          >
            <div className={styles.desktopScaleWrap}>
              <div
                className={styles.desktopScaleInner}
                data-anchor={anchor}
                style={{ transform: `scale(calc(100cqw / 375px)) translateY(${desktopDrag.pan}vh)` }}
              >
                <HeroSection
                  variant={heroVariant}
                  names={[name1, name2]}
                  eventDate={dateLabel}
                  photoUrl={photoUrl}
                  themeCategory={effectiveDecorCategory(theme)}
                />
                {/* Matches .phoneScaleInner below -- same reasoning: without
                    real sections here, dragging this panel would just pan
                    past its own (Hero-only) content into empty space. */}
                <LetterSection
                  variant="ornate-border"
                  title={t.letterTitle}
                  body={t.letterBody}
                  quote={previewQuoteFor(theme.id)}
                  locale={resolvedLocale}
                />
                <TimelineSection variant="vertical-line" title={t.scheduleTitle} events={previewTimelineEvents} />
              </div>
            </div>
          </div>

          {(!selected || onCustomize) && (
            <div className={styles.hoverReveal} aria-hidden="true">
              <span className={styles.hoverRevealBtn}>{selected ? t.customize : t.chooseStyle}</span>
            </div>
          )}

          {PHOTO_PROMINENT_HERO_VARIANTS.has(heroVariant) && (
            <span className={styles.photoBadge} title={t.builtForPhotoTitle}>
              {t.builtForPhoto}
            </span>
          )}

          <div
            ref={phoneWrapRef}
            className={styles.phoneMockup}
            data-dragging={phoneDrag.dragging || undefined}
            {...phoneDrag.handlers}
          >
            <span className={styles.phoneNotch} aria-hidden="true" />
            <div className={styles.phoneChrome} aria-hidden="true">
              <span className={styles.phoneMenuIcon} />
              <span className={styles.phoneCalendarPill}>{t.addToCalendar}</span>
            </div>
            <div className={styles.phoneScaleWrap}>
              <div
                className={styles.phoneScaleInner}
                data-anchor={anchor}
                style={{ transform: `scale(calc(100cqw / 375px)) translateY(${phoneDrag.pan}vh)` }}
              >
                <HeroSection
                  variant={heroVariant}
                  names={[name1, name2]}
                  eventDate={dateLabel}
                  photoUrl={photoUrl}
                  themeCategory={effectiveDecorCategory(theme)}
                />
                {/* Two more real sections below Hero -- drag-panning this
                    mockup (see useDragPan above) reveals Letter's decor +
                    sample copy, then Timeline's own sample schedule, instead
                    of just a longer look at Hero alone. Ornate Border
                    specifically for its corner-flourish decor (CSS-driven
                    off theme tokens, no themeCategory prop needed, unlike
                    Hero's motif system). */}
                <LetterSection
                  variant="ornate-border"
                  title={t.letterTitle}
                  body={t.letterBody}
                  quote={previewQuoteFor(theme.id)}
                  locale={resolvedLocale}
                />
                <TimelineSection variant="vertical-line" title={t.scheduleTitle} events={previewTimelineEvents} />
              </div>
            </div>
            {countdown && !countdown.reached && (
              <div className={styles.phoneTimer} aria-hidden="true">
                {[
                  { value: countdown.weeks, label: t.countdown.weeks },
                  { value: countdown.days, label: t.countdown.days },
                  { value: countdown.hours, label: t.countdown.hours },
                  { value: countdown.minutes, label: t.countdown.minutes },
                  { value: countdown.seconds, label: t.countdown.seconds },
                ].map((unit) => (
                  <div key={unit.label} className={styles.timerUnit}>
                    <span className={styles.timerValue}>{String(unit.value).padStart(2, "0")}</span>
                    <span className={styles.timerLabel}>{unit.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ThemeProvider>

      <p className={styles.domainCaption}>{t.domainCaption}</p>

      {tags.length > 0 && (
        <div className={styles.tagRow}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tagPill}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className={styles.customizeCaption}>{t.customizeFurther}</p>

      <div className={styles.cardFooter}>
        <p className={styles.cardName}>{theme.name}</p>
        {/* A curated sample of real, working capabilities (varied by
            category for catalog browsing variety), never an exclusivity
            claim -- see highlightFeatures.ts's own comment for why every
            theme supports the exact same full feature set under the hood. */}
        <p className={styles.cardFeatures}>{highlightFeatures.join(" · ")}</p>
      </div>
    </button>
  );
}
