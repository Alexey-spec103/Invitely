"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { themes, getTheme, DEFAULT_THEME_ID } from "@/lib/themes";
import ThemeGallery from "@/components/theme/ThemeGallery";
import MaterialsPreviewModal from "@/components/theme/MaterialsPreviewModal";
import HowItWorksButton from "./HowItWorksButton";
import DesignSlotsPanel from "./DesignSlotsPanel";
import { updateTheme } from "../actions";
import EventTypeSwitcher from "../EventTypeSwitcher";
import ColorVariantPicker from "./ColorVariantPicker";
import type { Locale } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/dictionary";

interface ThemeSlotRow {
  id: string;
  theme_id: string;
}

interface ThemeHistoryRow {
  id: string;
  theme_id: string;
  changed_at: string;
}

interface ThemeSelectFormProps {
  eventId: string;
  currentThemeId: string;
  currentColorVariantId: string | null;
  eventType: string;
  name1: string;
  name2?: string;
  eventDate: string | null;
  slots: ThemeSlotRow[];
  history: ThemeHistoryRow[];
  locale: Locale;
}

export default function ThemeSelectForm({
  eventId,
  currentThemeId,
  currentColorVariantId,
  eventType,
  name1,
  name2,
  eventDate,
  slots,
  history,
  locale,
}: ThemeSelectFormProps) {
  const t = getDictionary(locale).dashboard.style;
  const router = useRouter();
  const [selected, setSelected] = useState(currentThemeId);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  // dashboard critique (2026-10-23), P2: picking a theme used to commit
  // instantly with zero confirmation or safety net -- the single
  // highest-stakes click on this tab, worse reversibility than deleting a
  // guest already has. Switching back is itself just another selection, so
  // "Undo" is literally performSwitch(previousId) -- no new mutation shape
  // needed, just remembering what the previous theme was.
  const SWITCH_TOAST_MS = 6000;
  const [switchToast, setSwitchToast] = useState<{ previousThemeId: string; themeName: string } | null>(null);
  const switchToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  let selectedTheme;
  try {
    selectedTheme = getTheme(selected);
  } catch {
    selectedTheme = getTheme(DEFAULT_THEME_ID);
  }

  const performSwitch = (themeId: string, options: { silent?: boolean } = {}) => {
    const previousThemeId = selected;
    setSelected(themeId);
    setError(null);
    if (switchToastTimeoutRef.current) clearTimeout(switchToastTimeoutRef.current);
    startTransition(async () => {
      const result = await updateTheme({ eventId, themeId });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      // `selected` already drives every theme-dependent child
      // (ColorVariantPicker, MaterialsPreviewModal) reactively via local
      // state, so the only thing router.refresh() is actually for here is
      // syncing server-held data (DesignSlotsPanel's history list) --
      // deferring it until the undo window closes, same as GuestManager's
      // removal toast already does for its own real mutation.
      if (options.silent) {
        setSwitchToast(null);
        router.refresh();
        return;
      }
      let themeName = themeId;
      try {
        themeName = getTheme(themeId).name;
      } catch {
        // Unknown id -- fall back to showing the raw id rather than
        // blocking the toast entirely.
      }
      setSwitchToast({ previousThemeId, themeName });
      switchToastTimeoutRef.current = setTimeout(() => {
        setSwitchToast(null);
        router.refresh();
      }, SWITCH_TOAST_MS);
    });
  };

  const handleSelect = (themeId: string) => performSwitch(themeId);

  // Undoing is its own switch (back to whatever was active before), just
  // silent -- otherwise undoing would immediately arm a new "Switched to
  // {old theme} · Undo" toast for itself. performSwitch's own clearTimeout
  // at its top cancels the original switch's deferred refresh, so it never
  // fires after the undo has already reverted it.
  const handleUndoSwitch = () => {
    if (!switchToast) return;
    performSwitch(switchToast.previousThemeId, { silent: true });
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="dash-h1 text-gray-900">{t.header.title}</h1>
          <p className="mt-1 text-sm text-gray-600">{t.header.subtitle}</p>
          <p className="mt-1 text-xs text-gray-600">{t.header.helper}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <EventTypeSwitcher
            eventId={eventId}
            currentEventType={eventType}
            name1={name1}
            name2={name2}
            locale={locale}
          />
          <HowItWorksButton locale={locale} />
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="dash-btn dash-btn-neutral"
          >
            {t.header.previewFullSet}
          </button>
        </div>
      </div>

      <ColorVariantPicker
        eventId={eventId}
        theme={selectedTheme}
        currentColorVariantId={currentColorVariantId}
        locale={locale}
      />

      <DesignSlotsPanel
        eventId={eventId}
        currentThemeId={selected}
        eventType={eventType}
        slots={slots}
        history={history}
        onActivate={handleSelect}
        activating={isPending}
        locale={locale}
      />

      {previewOpen && (
        <MaterialsPreviewModal
          theme={selectedTheme}
          name1={name1}
          name2={name2}
          eventDate={eventDate}
          onClose={() => setPreviewOpen(false)}
          locale={locale}
        />
      )}

      <div className="mt-6">
        <ThemeGallery
          themes={Object.values(themes)}
          selectedId={selected}
          onSelect={handleSelect}
          disabled={isPending}
          onCustomize={() => router.push(`/dashboard/${eventId}/site`)}
          eventType={eventType}
          locale={locale}
        />
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {switchToast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-lg"
        >
          <span className="text-gray-700">{t.switchToast.switched(switchToast.themeName)}</span>
          <button
            type="button"
            onClick={handleUndoSwitch}
            className="font-semibold text-[var(--dash-accent-text)] hover:underline"
          >
            {t.switchToast.undo}
          </button>
        </div>
      )}
    </div>
  );
}
