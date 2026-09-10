"use client";

import { useEffect, useMemo, useState, type KeyboardEvent, type MouseEvent } from "react";
import { Sparkles, Heart } from "lucide-react";
import ThemeProvider from "@/components/theme/ThemeProvider";
import {
  THEME_CATEGORIES,
  THEME_SEASONS,
  THEME_LAYOUTS,
  layoutLabelFor,
  POPULAR_THEME_IDS,
  NEW_THEME_IDS,
} from "@/lib/themes";
import type { Theme, ThemeCategory, ThemeSeason } from "@/lib/themes";
import { useFavoriteThemes } from "@/lib/useFavoriteThemes";
import { CATEGORY_STYLE_ICONS, LAYOUT_STYLE_ICONS } from "@/components/icons/StyleFilterIcons";
import { recommendedHeroVariantFor } from "@/lib/themes/recommendedHeroVariant";
import { HeroSection, HERO_VARIANTS, DEFAULT_HERO_VARIANT } from "@/components/sections/HeroSection";
import type { HeroVariant } from "@/components/sections/HeroSection";
import {
  previewPhotoFor,
  previewNamesFor,
  previewTargetDateFor,
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


const PAGE_SIZE = 24;

const CATEGORY_LABELS: Record<ThemeCategory, string> = {
  romantic: "Romantic",
  modern: "Modern",
  botanical: "Botanical",
  boho: "Boho",
  luxury: "Luxury",
  dark: "Dark & Moody",
  coastal: "Coastal",
  rustic: "Rustic",
  vintage: "Vintage",
  minimal: "Minimal",
};

const SEASON_LABELS: Record<ThemeSeason, string> = {
  spring: "Spring",
  summer: "Summer",
  autumn: "Autumn",
  winter: "Winter",
};

interface ThemeGalleryProps {
  themes: Theme[];
  selectedId?: string;
  onSelect: (themeId: string) => void;
  disabled?: boolean;
  /** dashboard-audit.md A6 -- see `ThemeGalleryCardProps.onCustomize`. */
  onCustomize?: () => void;
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
}: ThemeGalleryProps) {
  // dashboard-audit.md B6: weddingpost.ru's catalog opens on its "Популярные"
  // entry rather than an unfiltered "all" -- confirmed live. This is a
  // separate axis from category/season/layout below (an "entry", not a
  // category, per the audit's own wording), so picking one clears the other
  // filters and vice versa rather than trying to combine both at once.
  const [entry, setEntry] = useState<EntryId | null>("popular");
  const [style, setStyle] = useState<StyleValue | null>(null);
  const [season, setSeason] = useState<ThemeSeason | "all">("all");
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
  }, [themes, entry, favoriteIds, style, season, query]);

  const visible = filtered.slice(0, visibleCount);

  const selectEntry = (next: EntryId) => {
    setEntry((current) => (current === next ? null : next));
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

  const categoryEntries = Object.entries(THEME_CATEGORIES) as [ThemeCategory, number][];
  const seasonEntries = Object.entries(THEME_SEASONS) as [ThemeSeason, number][];
  const layoutEntries = Object.entries(THEME_LAYOUTS).sort((a, b) => b[1] - a[1]);
  const combinedStyleEntries: StyleEntry[] = [
    ...categoryEntries.map(([cat, count]) => ({ kind: "category" as const, id: cat, label: CATEGORY_LABELS[cat], count })),
    ...layoutEntries.map(([label, count]) => ({ kind: "layout" as const, id: label, label, count })),
  ].sort((a, b) => b.count - a.count);

  return (
    <div className={styles.root}>
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <input
          type="search"
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          placeholder="Search styles..."
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
              Popular
            </span>
            <span className={styles.count}>{POPULAR_THEME_IDS.length}</span>
          </button>
          <button
            type="button"
            onClick={() => selectEntry("new")}
            className={entry === "new" ? styles.filterActive : styles.filterBtn}
          >
            <span>New</span>
            <span className={styles.newBadge}>NEW</span>
          </button>
          {seasonEntries.map(([s]) => (
            <button
              key={`entry-${s}`}
              type="button"
              onClick={() => updateSeason(season === s && entry === null ? "all" : s)}
              className={entry === null && season === s ? styles.filterActive : styles.filterBtn}
            >
              <span>
                {SEASON_LABELS[s]} {currentYear}
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => selectEntry("favorites")}
            className={entry === "favorites" ? styles.filterActive : styles.filterBtn}
          >
            <span className={styles.entryLabel}>
              <Heart className="h-3.5 w-3.5" aria-hidden="true" />
              Favorites
            </span>
            <span className={styles.count}>{favoriteIds.size}</span>
          </button>
        </div>

        <hr className={styles.entriesDivider} />

        <div className={styles.filterGroup}>
          <p className={styles.filterLabel}>Style</p>
          <button
            type="button"
            onClick={() => updateStyle(null)}
            className={style === null ? styles.filterActive : styles.filterBtn}
          >
            <span>All styles</span>
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
          <p className={styles.filterLabel}>Season</p>
          <button
            type="button"
            onClick={() => updateSeason("all")}
            className={season === "all" ? styles.filterActive : styles.filterBtn}
          >
            <span>All year</span>
          </button>
          {seasonEntries.map(([s, count]) => (
            <button
              key={s}
              type="button"
              onClick={() => updateSeason(s)}
              className={season === s ? styles.filterActive : styles.filterBtn}
            >
              <span>{SEASON_LABELS[s]}</span>
              <span className={styles.count}>{count}</span>
            </button>
          ))}
        </div>
      </aside>

      <div className={styles.gallery}>
        <p className={styles.resultsCount}>
          {filtered.length} {filtered.length === 1 ? "style" : "styles"}
        </p>
        <div className={styles.grid}>
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
            />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className={styles.empty}>No styles match — try clearing a filter or search.</p>
        )}
        {visibleCount < filtered.length && (
          <button
            type="button"
            className={styles.showMore}
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            Show more styles ({filtered.length - visibleCount} more)
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
}: ThemeGalleryCardProps) {
  const [name1, name2] = previewNamesFor(theme.id);
  const photoUrl = `${previewPhotoFor(theme.id, theme.category)}?w=500&q=70&fit=crop&auto=format`;
  const targetDate = useMemo(() => previewTargetDateFor(theme.id, theme.season), [theme.id, theme.season]);
  const dateLabel = formatPreviewDate(targetDate);
  const layoutLabel = layoutLabelFor(theme.id, theme.category);
  const tags = [layoutLabel, ...theme.tags.filter((tag) => tag !== layoutLabel)].slice(0, 4);
  const recommendedVariant = recommendedHeroVariantFor(theme.id, theme.category);
  const heroVariant: HeroVariant = HERO_VARIANTS.includes(recommendedVariant as HeroVariant)
    ? (recommendedVariant as HeroVariant)
    : DEFAULT_HERO_VARIANT;
  const anchor = anchorFor(heroVariant);

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
      onClick={() => (selected && onCustomize ? onCustomize() : onSelect(theme.id))}
      className={selected ? styles.cardSelected : styles.card}
    >
      <ThemeProvider theme={theme}>
        <div className={styles.duoMockup}>
          {onToggleFavorite && (
            <span
              role="button"
              tabIndex={0}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              onClick={handleFavoriteClick}
              onKeyDown={handleFavoriteKeyDown}
              className={styles.favoriteHeart}
            >
              <Heart className="h-[18px] w-[18px]" fill={isFavorite ? "currentColor" : "none"} aria-hidden="true" />
            </span>
          )}
          <div className={styles.desktopPanel}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl} alt="" className={styles.invitePhoto} loading="lazy" />
            <div className={styles.invitePhotoOverlay} />
            <div className={styles.inviteContent}>
              <span className={styles.inviteEyebrow}>Together with their families</span>
              <span className={styles.inviteNames}>
                {name1} &amp; {name2}
              </span>
              <span className={styles.inviteDivider} />
              <span className={styles.inviteDate}>{dateLabel}</span>
            </div>
          </div>

          {(!selected || onCustomize) && (
            <div className={styles.hoverReveal} aria-hidden="true">
              <span className={styles.hoverRevealBtn}>{selected ? "Customize →" : "Choose this style"}</span>
            </div>
          )}

          <div className={styles.phoneMockup}>
            <span className={styles.phoneNotch} aria-hidden="true" />
            <div className={styles.phoneChrome} aria-hidden="true">
              <span className={styles.phoneMenuIcon} />
              <span className={styles.phoneCalendarPill}>Add to calendar</span>
            </div>
            <div className={styles.phoneScaleWrap}>
              <div className={styles.phoneScaleInner} data-anchor={anchor}>
                <HeroSection variant={heroVariant} names={[name1, name2]} eventDate={dateLabel} photoUrl={photoUrl} />
              </div>
            </div>
            {countdown && !countdown.reached && (
              <div className={styles.phoneTimer} aria-hidden="true">
                {[
                  { value: countdown.weeks, label: "weeks" },
                  { value: countdown.days, label: "days" },
                  { value: countdown.hours, label: "hours" },
                  { value: countdown.minutes, label: "minutes" },
                  { value: countdown.seconds, label: "seconds" },
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

      <p className={styles.domainCaption}>yourname.com</p>

      {tags.length > 0 && (
        <div className={styles.tagRow}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tagPill}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className={styles.customizeCaption}>Everything can be customized further in the constructor</p>

      <div className={styles.cardFooter}>
        <p className={styles.cardName}>{theme.name}</p>
      </div>
    </button>
  );
}
