"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { History, Plus, X } from "lucide-react";
import { themes, getTheme, DEFAULT_THEME_ID } from "@/lib/themes";
import ThemeGallery from "@/components/theme/ThemeGallery";
import { addThemeSlot, removeThemeSlot } from "./actions";
import styles from "./DesignSlotsPanel.module.css";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

interface ThemeSlotRow {
  id: string;
  theme_id: string;
}

interface ThemeHistoryRow {
  id: string;
  theme_id: string;
  changed_at: string;
}

interface DesignSlotsPanelProps {
  eventId: string;
  currentThemeId: string;
  /** dashboard critique (2026-10-23), P1: the "Add a design slot" modal's
   * own <ThemeGallery> below used to omit this, so a host shortlisting a
   * candidate for e.g. a Wedding saw all 124 themes unfiltered -- including
   * Corporate/Birthday/Kids'-Party-only categories the main gallery
   * (ThemeSelectForm.tsx) deliberately hides via this same prop. */
  eventType: string;
  slots: ThemeSlotRow[];
  history: ThemeHistoryRow[];
  /** Reuses the same activation path the gallery below already uses --
   * switching a slot in or reverting from history is just "make this theme
   * active", identical to picking a different card in the catalog. */
  onActivate: (themeId: string) => void;
  activating: boolean;
  /** Optional, defaulting to English -- same convention as ModuleCard/
   * FirstVisitTour, so any not-yet-localized call site keeps working. */
  locale?: Locale;
}

function themeLabel(themeId: string): string {
  try {
    return getTheme(themeId).name;
  } catch {
    return themeId;
  }
}

function relativeTime(iso: string, t: ReturnType<typeof getDictionary>["dashboard"]["style"]["designSlots"]): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return t.justNow;
  if (minutes < 60) return t.minutesAgo(minutes);
  const hours = Math.round(minutes / 60);
  if (hours < 24) return t.hoursAgo(hours);
  const days = Math.round(hours / 24);
  return t.daysAgo(days);
}

/** dashboard-audit.md B11: weddingpost.ru's "Слоты стилей" card -- hold a
 * few candidate themes alongside the active one and switch between them --
 * plus their small ⟲ version-history icon. `theme_slots` only ever holds
 * the *extra* candidates (see actions.ts); the active theme itself is
 * site_config.theme_id, rendered here as the first, non-removable card. */
export default function DesignSlotsPanel({
  eventId,
  currentThemeId,
  eventType,
  slots,
  history,
  onActivate,
  activating,
  locale,
}: DesignSlotsPanelProps) {
  const t = getDictionary(locale ?? "en").dashboard.style.designSlots;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  // dashboard critique (2026-10-23), fifth re-run P2: this popover had no
  // outside-click or Escape dismissal -- confirmed live, it stayed open
  // through an Escape press and a click on an unrelated button, letting it
  // stack with Style's own "How does this work?" popover at once. Same
  // pattern as that popover's own HowItWorksButton.tsx.
  useEffect(() => {
    if (!historyOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setHistoryOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setHistoryOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [historyOpen]);

  let currentTheme;
  try {
    currentTheme = getTheme(currentThemeId);
  } catch {
    currentTheme = getTheme(DEFAULT_THEME_ID);
  }

  const handleAddSlot = (themeId: string) => {
    setError(null);
    setAddOpen(false);
    startTransition(async () => {
      try {
        const result = await addThemeSlot({ eventId, themeId });
        if (!result.ok) throw new Error(result.message);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : t.failedToAdd);
      }
    });
  };

  const handleRemoveSlot = (slotId: string) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await removeThemeSlot({ eventId, slotId });
        if (!result.ok) throw new Error(result.message);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : t.failedToRemove);
      }
    });
  };

  const busy = isPending || activating;
  const nonActiveHistory = history.filter((entry) => entry.theme_id !== currentThemeId);
  // A slot whose theme just became active is redundant with the "Active"
  // card above -- filtered here as a belt-and-suspenders guard, but the real
  // fix is activateTheme below actually deleting that row so it doesn't
  // linger (confirmed live: without this, the same theme showed twice --
  // once "Active", once as a now-pointless slot -- until the row was
  // manually removed).
  const visibleSlots = slots.filter((slot) => slot.theme_id !== currentThemeId);

  const activateTheme = (themeId: string) => {
    onActivate(themeId);
    const redundantSlot = slots.find((slot) => slot.theme_id === themeId);
    if (redundantSlot) {
      handleRemoveSlot(redundantSlot.id);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        <div className={styles.card} aria-current="true">
          <span
            className={styles.swatch}
            style={{ background: currentTheme.vars["--theme-bg"] }}
          >
            <span className={styles.swatchAccent} style={{ background: currentTheme.vars["--theme-accent"] }} />
          </span>
          <span className={styles.cardName}>{currentTheme.name}</span>
          <span className={styles.cardBadge}>{t.active}</span>
        </div>

        {visibleSlots.map((slot) => {
          let slotTheme;
          try {
            slotTheme = getTheme(slot.theme_id);
          } catch {
            return null;
          }
          return (
            <button
              key={slot.id}
              type="button"
              className={styles.card}
              disabled={busy}
              onClick={() => activateTheme(slot.theme_id)}
            >
              <span className={styles.swatch} style={{ background: slotTheme.vars["--theme-bg"] }}>
                <span className={styles.swatchAccent} style={{ background: slotTheme.vars["--theme-accent"] }} />
              </span>
              <span className={styles.cardName}>{slotTheme.name}</span>
              <span
                role="button"
                tabIndex={0}
                aria-label={t.removeSlot(slotTheme.name)}
                className={styles.removeBtn}
                onClick={(event) => {
                  event.stopPropagation();
                  handleRemoveSlot(slot.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    handleRemoveSlot(slot.id);
                  }
                }}
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </span>
            </button>
          );
        })}

        <button
          type="button"
          className={styles.addCard}
          onClick={() => setAddOpen(true)}
          disabled={busy}
          aria-label={t.addSlot}
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className={styles.historyWrap} ref={historyRef}>
          <button
            type="button"
            className={styles.historyBtn}
            onClick={() => setHistoryOpen((open) => !open)}
            aria-label={t.historyLabel}
            aria-expanded={historyOpen}
          >
            <History className="h-4 w-4" aria-hidden="true" />
          </button>
          {historyOpen && (
            <div className={styles.historyPopover}>
              <p className={styles.historyTitle}>{t.recentStyles}</p>
              {nonActiveHistory.length === 0 ? (
                <p className={styles.historyEmpty}>{t.noPastStyles}</p>
              ) : (
                <ul className={styles.historyList}>
                  {nonActiveHistory.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        className={styles.historyItem}
                        disabled={busy}
                        onClick={() => {
                          setHistoryOpen(false);
                          activateTheme(entry.theme_id);
                        }}
                      >
                        <span>{themeLabel(entry.theme_id)}</span>
                        <span className={styles.historyTime}>{relativeTime(entry.changed_at, t)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {addOpen && (
        <div className={styles.overlay} onClick={() => setAddOpen(false)}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalEyebrow}>{t.addModalEyebrow}</p>
                <p className={styles.modalHint}>{t.addModalHint}</p>
              </div>
              <button type="button" className={styles.closeBtn} onClick={() => setAddOpen(false)} aria-label={t.close}>
                &times;
              </button>
            </div>
            <div className={styles.modalGallery}>
              <ThemeGallery
                themes={Object.values(themes)}
                selectedId={currentThemeId}
                onSelect={handleAddSlot}
                eventType={eventType}
                locale={locale}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
