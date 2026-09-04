"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { themes, getTheme, DEFAULT_THEME_ID } from "@/lib/themes";
import ThemeGallery from "@/components/theme/ThemeGallery";
import MaterialsPreviewModal from "@/components/theme/MaterialsPreviewModal";
import { updateTheme } from "../actions";

interface ThemeSelectFormProps {
  eventId: string;
  currentThemeId: string;
  name1: string;
  name2?: string;
  eventDate: string | null;
}

export default function ThemeSelectForm({
  eventId,
  currentThemeId,
  name1,
  name2,
  eventDate,
}: ThemeSelectFormProps) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentThemeId);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  let selectedTheme;
  try {
    selectedTheme = getTheme(selected);
  } catch {
    selectedTheme = getTheme(DEFAULT_THEME_ID);
  }

  const handleSelect = (themeId: string) => {
    setSelected(themeId);
    setError(null);
    startTransition(async () => {
      try {
        await updateTheme({ eventId, themeId });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save");
      }
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="border-l-4 border-[var(--dash-accent)] pl-4">
          <h1 className="dash-h1 text-gray-900">Style</h1>
          <p className="mt-1 text-sm text-gray-500">Pick a theme for your site.</p>
        </div>
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="dash-btn dash-btn-neutral"
        >
          Preview full material set
        </button>
      </div>

      {previewOpen && (
        <MaterialsPreviewModal
          theme={selectedTheme}
          name1={name1}
          name2={name2}
          eventDate={eventDate}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      <div className="mt-6">
        <ThemeGallery
          themes={Object.values(themes)}
          selectedId={selected}
          onSelect={handleSelect}
          disabled={isPending}
        />
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
