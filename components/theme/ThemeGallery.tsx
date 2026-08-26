"use client";

import { useEffect, useMemo, useState } from "react";
import ThemeProvider from "@/components/theme/ThemeProvider";
import { THEME_CATEGORIES, THEME_SEASONS, THEME_LAYOUTS, layoutLabelFor } from "@/lib/themes";
import type { Theme, ThemeCategory, ThemeSeason } from "@/lib/themes";
import {
  previewPhotoFor,
  previewNamesFor,
  previewTargetDateFor,
  previewDateStyleFor,
  previewDomainFor,
  formatPreviewDate,
} from "@/lib/themes/previewMedia";
import styles from "./ThemeGallery.module.css";

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
}

/** Category/season sidebar + search + a live, screenshot-free dual mockup
 * per card (invitation-card preview stacked on a simplified site strip) --
 * mirrors weddingpost.ru's gallery framing without copying any of their
 * actual artwork. Reused as-is across dashboard, onboarding, and (later)
 * the public landing page: this component only ever reports an id via
 * `onSelect`, the caller decides what that means (save, form field, or a
 * `?theme=` link). */
export default function ThemeGallery({ themes, selectedId, onSelect, disabled }: ThemeGalleryProps) {
  const [category, setCategory] = useState<ThemeCategory | "all">("all");
  const [season, setSeason] = useState<ThemeSeason | "all">("all");
  const [layout, setLayout] = useState<string | "all">("all");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // One shared ticking clock for every card's countdown, instead of each of
  // up to 24 visible cards running its own setInterval.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const immediate = setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);
    return () => {
      clearTimeout(immediate);
      clearInterval(interval);
    };
  }, []);

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
              now={now}
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

interface ThemeGalleryCardProps {
  theme: Theme;
  selected: boolean;
  disabled?: boolean;
  onSelect: (themeId: string) => void;
  now: number | null;
}

interface CountdownParts {
  d: number;
  h: number;
  m: number;
  s: number;
}

function countdownPartsFor(target: Date, now: number): CountdownParts {
  const diff = Math.max(0, target.getTime() - now);
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff / 3600000) % 24),
    m: Math.floor((diff / 60000) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

function ThemeGalleryCard({ theme, selected, disabled, onSelect, now }: ThemeGalleryCardProps) {
  const [name1, name2] = previewNamesFor(theme.id);
  const initials = `${name1[0]}${name2[0]}`;
  const photoUrl = `${previewPhotoFor(theme.id, theme.category)}?w=500&q=70&fit=crop&auto=format`;
  const targetDate = useMemo(() => previewTargetDateFor(theme.id), [theme.id]);
  const dateLabel = formatPreviewDate(targetDate, previewDateStyleFor(theme.category));
  const domain = previewDomainFor(name1, name2);
  const layoutLabel = layoutLabelFor(theme.id, theme.category);
  const tags = [layoutLabel, ...theme.tags.filter((tag) => tag !== layoutLabel)].slice(0, 4);
  const countdown = now === null ? null : countdownPartsFor(targetDate, now);

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

          <div className={styles.phoneMockup}>
            <span className={styles.phoneNotch} aria-hidden="true" />
            <div className={styles.phoneScreen}>
              <span className={styles.phoneCalendarBtn}>+ Calendar</span>
              <span className={styles.phoneMonogram}>{initials}</span>
              <span className={styles.phoneNames}>
                {name1} &amp; {name2}
              </span>
              <div className={styles.phoneCountdown}>
                {(["d", "h", "m", "s"] as const).map((unit) => (
                  <div key={unit} className={styles.phoneCountdownDigit}>
                    <span className={styles.phoneCountdownNumber}>
                      {countdown ? String(countdown[unit]).padStart(2, "0") : "--"}
                    </span>
                    <span className={styles.phoneCountdownLabel}>{unit.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>

      <p className={styles.domainCaption}>{domain}</p>

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
