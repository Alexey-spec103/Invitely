"use client";

import { useEffect, useMemo, useState } from "react";
import ThemeProvider from "@/components/theme/ThemeProvider";
import { THEME_CATEGORIES, THEME_SEASONS, THEME_LAYOUTS, layoutLabelFor } from "@/lib/themes";
import type { Theme, ThemeCategory, ThemeSeason } from "@/lib/themes";
import { recommendedHeroVariantFor } from "@/lib/themes/recommendedHeroVariant";
import { HeroSection, HERO_VARIANTS, DEFAULT_HERO_VARIANT } from "@/components/sections/HeroSection";
import type { HeroVariant } from "@/components/sections/HeroSection";
import {
  previewPhotoFor,
  previewNamesFor,
  previewTargetDateFor,
  previewDateStyleFor,
  previewDomainFor,
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
  /** Adds the decorative site-chrome overlay (hamburger + "Add to calendar"
   * pill, countdown timer, "yourname.com" placeholder domain) that mirrors
   * weddingpost.ru's own gallery preview. Only for the public marketing
   * landing page -- in the dashboard/onboarding a real user is picking
   * their own theme, and fake chrome there would just read as broken UI. */
  isMarketingPreview?: boolean;
}

/** Category/season sidebar + search + a live, screenshot-free dual mockup
 * per card (invitation-card preview stacked on a simplified site strip) --
 * mirrors weddingpost.ru's gallery framing without copying any of their
 * actual artwork. Reused as-is across dashboard, onboarding, and (later)
 * the public landing page: this component only ever reports an id via
 * `onSelect`, the caller decides what that means (save, form field, or a
 * `?theme=` link). */
export default function ThemeGallery({
  themes,
  selectedId,
  onSelect,
  disabled,
  isMarketingPreview = false,
}: ThemeGalleryProps) {
  const [category, setCategory] = useState<ThemeCategory | "all">("all");
  const [season, setSeason] = useState<ThemeSeason | "all">("all");
  const [layout, setLayout] = useState<string | "all">("all");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return themes.filter((theme) => {
      if (category !== "all" && theme.category !== category) return false;
      if (season !== "all" && theme.season !== season) return false;
      if (layout !== "all" && layoutLabelFor(theme.id, theme.category) !== layout) return false;
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
  }, [themes, category, season, layout, query]);

  const visible = filtered.slice(0, visibleCount);

  const updateCategory = (next: ThemeCategory | "all") => {
    setCategory(next);
    setVisibleCount(PAGE_SIZE);
  };

  const updateSeason = (next: ThemeSeason | "all") => {
    setSeason(next);
    setVisibleCount(PAGE_SIZE);
  };

  const updateLayout = (next: string | "all") => {
    setLayout(next);
    setVisibleCount(PAGE_SIZE);
  };

  const updateQuery = (next: string) => {
    setQuery(next);
    setVisibleCount(PAGE_SIZE);
  };

  const categoryEntries = Object.entries(THEME_CATEGORIES) as [ThemeCategory, number][];
  const seasonEntries = Object.entries(THEME_SEASONS) as [ThemeSeason, number][];
  const layoutEntries = Object.entries(THEME_LAYOUTS).sort((a, b) => b[1] - a[1]);

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
          <p className={styles.filterLabel}>Style</p>
          <button
            type="button"
            onClick={() => updateCategory("all")}
            className={category === "all" ? styles.filterActive : styles.filterBtn}
          >
            <span>All styles</span>
            <span className={styles.count}>{themes.length}</span>
          </button>
          {categoryEntries.map(([cat, count]) => (
            <button
              key={cat}
              type="button"
              onClick={() => updateCategory(cat)}
              className={category === cat ? styles.filterActive : styles.filterBtn}
            >
              <span>{CATEGORY_LABELS[cat]}</span>
              <span className={styles.count}>{count}</span>
            </button>
          ))}
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

        <div className={styles.filterGroup}>
          <p className={styles.filterLabel}>Layout</p>
          <button
            type="button"
            onClick={() => updateLayout("all")}
            className={layout === "all" ? styles.filterActive : styles.filterBtn}
          >
            <span>All layouts</span>
          </button>
          {layoutEntries.map(([label, count]) => (
            <button
              key={label}
              type="button"
              onClick={() => updateLayout(label)}
              className={layout === label ? styles.filterActive : styles.filterBtn}
            >
              <span>{label}</span>
              <span className={styles.count}>{count}</span>
            </button>
          ))}
        </div>
      </aside>

      <div>
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
              isMarketingPreview={isMarketingPreview}
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
  isMarketingPreview?: boolean;
}

/** Exported so `LandingThemeShowcase` (the trimmed, no-filters 6-card
 * teaser on the public landing page) can reuse the exact same card --
 * phone-mockup rendering, crop-fix, marketing chrome, all of it -- instead
 * of forking a second copy that would drift out of sync. */
export function ThemeGalleryCard({ theme, selected, disabled, onSelect, isMarketingPreview }: ThemeGalleryCardProps) {
  const [name1, name2] = previewNamesFor(theme.id);
  const photoUrl = `${previewPhotoFor(theme.id, theme.category)}?w=500&q=70&fit=crop&auto=format`;
  const targetDate = useMemo(() => previewTargetDateFor(theme.id, theme.season), [theme.id, theme.season]);
  const dateLabel = formatPreviewDate(targetDate, previewDateStyleFor(theme.category));
  const domain = previewDomainFor(name1, name2);
  const layoutLabel = layoutLabelFor(theme.id, theme.category);
  const tags = [layoutLabel, ...theme.tags.filter((tag) => tag !== layoutLabel)].slice(0, 4);
  const recommendedVariant = recommendedHeroVariantFor(theme.id, theme.category);
  const heroVariant: HeroVariant = HERO_VARIANTS.includes(recommendedVariant as HeroVariant)
    ? (recommendedVariant as HeroVariant)
    : DEFAULT_HERO_VARIANT;
  const anchor = anchorFor(heroVariant);

  // A static snapshot, not a live tick: this is a decorative marketing
  // thumbnail, not a real countdown, and up to ~24 cards on screen each
  // running their own setInterval(1000ms) re-render (as the real Countdown
  // section's SimpleDigits.tsx does for a single instance) made the whole
  // grid janky. Null until mount, since a Date.now()-based value computed
  // during the server render would almost always mismatch the client's
  // hydration-time value; deferred via setTimeout rather than called
  // directly in the effect body so the first paint isn't a synchronous
  // cascading render.
  const [countdown, setCountdown] = useState<CountdownParts | null>(null);
  useEffect(() => {
    if (!isMarketingPreview) return;
    const eventDateTime = targetDate.toISOString();
    const timeout = setTimeout(() => setCountdown(getCountdownParts(eventDateTime)), 0);
    return () => clearTimeout(timeout);
  }, [isMarketingPreview, targetDate]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(theme.id)}
      className={selected ? styles.cardSelected : styles.card}
    >
      <ThemeProvider theme={theme}>
        <div className={styles.duoMockup}>
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

          {!selected && (
            <div className={styles.hoverReveal} aria-hidden="true">
              <span className={styles.hoverRevealBtn}>Choose this style</span>
            </div>
          )}

          <div className={styles.phoneMockup}>
            <span className={styles.phoneNotch} aria-hidden="true" />
            {isMarketingPreview && (
              <div className={styles.phoneChrome} aria-hidden="true">
                <span className={styles.phoneMenuIcon} />
                <span className={styles.phoneCalendarPill}>Add to calendar</span>
              </div>
            )}
            <div className={styles.phoneScaleWrap}>
              <div className={styles.phoneScaleInner} data-anchor={anchor}>
                <HeroSection variant={heroVariant} names={[name1, name2]} eventDate={dateLabel} photoUrl={photoUrl} />
              </div>
            </div>
            {isMarketingPreview && countdown && !countdown.reached && (
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

      <p className={styles.domainCaption}>{isMarketingPreview ? "yourname.com" : domain}</p>

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
        {selected && <p className={styles.cardSelectedLabel}>Selected</p>}
      </div>
    </button>
  );
}
