"use client";

import { AlignCenter, AlignLeft, AlignRight, Bold, RotateCcw, Trash2 } from "lucide-react";
import type { TextStyleOverride } from "./EditableFieldContext";

interface InlineFieldToolbarProps {
  position: { top: number; left: number };
  override: TextStyleOverride | undefined;
  /** Only fields whose variant CSS treats alignment as meaningful pass this. */
  showAlign?: boolean;
  /** Only fields inside a repeatable array (Timeline events, Map venues) pass this. */
  onDelete?: () => void;
  onUpdate: (patch: TextStyleOverride) => void;
  onReset: () => void;
  measureRef?: (el: HTMLDivElement | null) => void;
}

const iconButtonClass =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--dash-text-muted)] hover:bg-white/10 hover:text-[var(--dash-text)]";
const iconButtonActiveClass =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--dash-accent)] text-[var(--dash-accent-contrast)]";

const ALIGN_OPTIONS = [
  { value: "left", Icon: AlignLeft },
  { value: "center", Icon: AlignCenter },
  { value: "right", Icon: AlignRight },
] as const;

/** Floating popover for the currently-selected editable text field --
 * intentionally a trimmed sibling of the Canvas editor's `ElementToolbar`,
 * not a reuse of it: no font-family picker (font family stays theme-owned),
 * no resize/rotate/z-order/duplicate (meaningless outside absolute-position
 * placement). Positioning math mirrors CanvasEditor's `recomputeToolbarPos`. */
export default function InlineFieldToolbar({
  position,
  override,
  showAlign,
  onDelete,
  onUpdate,
  onReset,
  measureRef,
}: InlineFieldToolbarProps) {
  const fontWeight = override?.fontWeight ?? 400;

  return (
    <div
      ref={measureRef}
      style={{ position: "fixed", top: position.top, left: position.left }}
      className="z-30 flex w-max items-center gap-1.5 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] p-2 shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <input
        type="number"
        value={override?.fontSize ?? ""}
        placeholder="Auto"
        onChange={(event) => onUpdate({ fontSize: event.target.value ? Number(event.target.value) : undefined })}
        className="w-16 rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface-2)] px-2 py-1.5 text-sm text-[var(--dash-text)]"
        title="Font size (px)"
      />
      <input
        type="color"
        value={override?.color ?? "#000000"}
        onChange={(event) => onUpdate({ color: event.target.value })}
        className="h-7 w-8 rounded border border-[var(--dash-border)]"
        title="Color"
      />
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onUpdate({ fontWeight: fontWeight >= 600 ? 400 : 700 })}
        title="Bold"
        className={fontWeight >= 600 ? iconButtonActiveClass : iconButtonClass}
      >
        <Bold className="h-4 w-4" aria-hidden="true" />
      </button>
      {showAlign &&
        ALIGN_OPTIONS.map(({ value, Icon }) => (
          <button
            key={value}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onUpdate({ textAlign: value })}
            title={`Align ${value}`}
            className={override?.textAlign === value ? iconButtonActiveClass : iconButtonClass}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        ))}
      <span className="mx-0.5 h-5 w-px bg-[var(--dash-border)]" />
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={onReset}
        title="Reset to theme default"
        className={iconButtonClass}
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
      </button>
      {onDelete && (
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onDelete}
          title="Delete"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
