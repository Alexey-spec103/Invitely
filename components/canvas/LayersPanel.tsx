"use client";

import type { CanvasElement, CanvasFrame } from "@/lib/canvas/types";
import type { BackgroundFill } from "@/lib/backgroundFills";
import BackgroundPicker from "@/components/background/BackgroundPicker";

interface LayersPanelProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onToggleDesktopOnly: (id: string) => void;
  onDelete: (id: string) => void;
  background: CanvasFrame["background"];
  onBackgroundFillChange: (fill: BackgroundFill | undefined) => void;
  onBackgroundImagePick: () => void;
  onBackgroundImageRemove: () => void;
  uploadingBackground: boolean;
  uploadError: string | null;
}

function elementLabel(element: CanvasElement): string {
  if (element.type === "text") {
    return element.text.trim() || "(empty text)";
  }
  if (element.type === "video") return "Video";
  if (element.type === "qr") return "QR code";
  return "Image";
}

function elementIcon(element: CanvasElement): string {
  if (element.type === "text") return "A";
  if (element.type === "video") return "🎬";
  if (element.type === "qr") return "▦";
  return "🖼";
}

/** A synced list of every element on the active frame -- clicking a row
 * selects the same element on the canvas (and vice versa, since both drive
 * the same `selectedId` state in CanvasEditor), matching weddingpost.ru's
 * own "Редактируемые блоки" panel observed in the audit. */
export default function LayersPanel({
  elements,
  selectedId,
  onSelect,
  onToggleHidden,
  onToggleDesktopOnly,
  onDelete,
  background,
  onBackgroundFillChange,
  onBackgroundImagePick,
  onBackgroundImageRemove,
  uploadingBackground,
  uploadError,
}: LayersPanelProps) {
  const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="w-64 flex-none overflow-y-auto border-l border-[var(--dash-border)] bg-[var(--dash-surface)]">
      <p className="border-b border-[var(--dash-border)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--dash-text-muted)]">
        Layers
      </p>
      {sorted.length === 0 && (
        <p className="px-3 py-4 text-xs text-[var(--dash-text-muted)]">Nothing on this page yet.</p>
      )}
      <ul>
        {sorted.map((element) => {
          const isSelected = element.id === selectedId;
          // Icons stay visible when the row is selected or hovered (group-hover),
          // and also whenever a toggle is in its non-default "on" state (hidden or
          // desktop-only) so that state doesn't silently disappear when the mouse
          // moves away -- matches weddingpost.ru's own layers panel, where these
          // icons only appear on hover/select rather than sitting on every row
          // permanently.
          const revealClass = isSelected
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100";
          return (
            <li
              key={element.id}
              className={
                "group flex items-center gap-2 border-b border-[var(--dash-border)] px-3 py-2 text-sm " +
                (isSelected ? "bg-[var(--dash-accent)]/10" : "hover:bg-white/5")
              }
            >
              <button
                type="button"
                onClick={() => onSelect(element.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
                title={elementLabel(element)}
              >
                <span className="shrink-0 text-[var(--dash-text-muted)]">{elementIcon(element)}</span>
                <span className="truncate text-[var(--dash-text)]">{elementLabel(element)}</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleDesktopOnly(element.id)}
                title={element.desktopOnly ? "Shown on desktop only — click to show everywhere" : "Show on desktop only"}
                className={
                  "shrink-0 rounded px-1 text-[10px] font-semibold uppercase transition-opacity " +
                  (element.desktopOnly ? "bg-[var(--dash-accent)] text-[var(--dash-accent-contrast)] opacity-100" : `text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] ${revealClass}`)
                }
              >
                D
              </button>
              <button
                type="button"
                onClick={() => onToggleHidden(element.id)}
                title={element.hidden ? "Hidden from your site — click to show" : "Hide from your site"}
                className={
                  "shrink-0 text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] transition-opacity " +
                  (element.hidden ? "opacity-100" : revealClass)
                }
              >
                {element.hidden ? "🙈" : "👁"}
              </button>
              <button
                type="button"
                onClick={() => onDelete(element.id)}
                title="Delete"
                className={"shrink-0 text-[var(--dash-text-muted)] hover:text-red-400 transition-opacity " + revealClass}
              >
                🗑
              </button>
            </li>
          );
        })}
      </ul>

      {/* Block-level (frame) settings, living in the same scrolling panel
       * right below the element list -- matches weddingpost.ru's own layers
       * panel, where a block's background/visibility settings sit under its
       * element list rather than in a separate always-visible toolbar. */}
      <div className="border-t border-[var(--dash-border)] px-3 py-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--dash-text-muted)]">Background</p>
        <BackgroundPicker value={background.fill} onChange={onBackgroundFillChange} />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={onBackgroundImagePick}
            disabled={uploadingBackground}
            className="flex-1 rounded-md border border-[var(--dash-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--dash-text)] hover:border-[var(--dash-accent)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploadingBackground ? "Uploading..." : background.imageUrl ? "Change image" : "Add photo"}
          </button>
        </div>
        {background.imageUrl && (
          <button
            type="button"
            onClick={onBackgroundImageRemove}
            className="mt-2 w-full rounded-md border border-[var(--dash-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--dash-text)] hover:border-[var(--dash-accent)]"
          >
            Remove image
          </button>
        )}
        {uploadError && <p className="mt-2 text-xs text-red-400">{uploadError}</p>}
      </div>
    </div>
  );
}
