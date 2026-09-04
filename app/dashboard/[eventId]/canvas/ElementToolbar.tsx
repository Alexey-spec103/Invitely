"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalSpaceAround,
  Bold,
  BringToFront,
  ChevronDown,
  ChevronUp,
  Copy,
  MoveHorizontal,
  Play,
  SendToBack,
  Trash2,
} from "lucide-react";
import type { CanvasElement } from "@/lib/canvas/types";
import FontPicker from "./FontPicker";

interface ElementToolbarProps {
  element: CanvasElement;
  position: { top: number; left: number };
  onUpdate: (patch: Partial<CanvasElement>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onReorder: (mode: "front" | "back" | "forward" | "backward") => void;
  onPreviewAnimation: () => void;
  /** Lets the parent measure this popover's own rendered height, so it can
   * flip above/below the selected element depending on available space. */
  measureRef?: (el: HTMLDivElement | null) => void;
}

const iconButtonClass =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--dash-text-muted)] hover:bg-white/10 hover:text-[var(--dash-text)]";
const iconButtonActiveClass =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--dash-accent)] text-[var(--dash-accent-contrast)]";

/** Floating per-element popover, anchored above (or below) the selected
 * element on the canvas -- replaces what used to be a permanent, always-
 * reflowing row in the top toolbar. Every control here is a straight port
 * of existing CanvasEditor logic (updateElement/duplicateSelected/
 * reorderSelected/deleteSelected/previewAnimId) -- this component only
 * changes how those controls are grouped and presented, matching the
 * icon-grouped floating popover observed on weddingpost.ru's own
 * constructor rather than a flat always-visible control row. */
export default function ElementToolbar({
  element,
  position,
  onUpdate,
  onDuplicate,
  onDelete,
  onReorder,
  onPreviewAnimation,
  measureRef,
}: ElementToolbarProps) {
  return (
    <div
      ref={measureRef}
      style={{ position: "absolute", top: position.top, left: position.left }}
      className="z-30 w-max max-w-[22rem] space-y-1.5 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] p-2 shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
      onMouseDown={(event) => event.stopPropagation()}
    >
      {element.type === "text" && (
        <>
          <div className="flex items-center gap-1.5">
            <FontPicker value={element.fontFamily} onChange={(family) => onUpdate({ fontFamily: family })} />
            <input
              type="number"
              value={element.fontSize}
              onChange={(event) => onUpdate({ fontSize: Number(event.target.value) || 1 })}
              className="w-14 rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface-2)] px-2 py-1.5 text-sm text-[var(--dash-text)]"
              title="Font size"
            />
            <input
              type="color"
              value={element.color}
              onChange={(event) => onUpdate({ color: event.target.value })}
              className="h-7 w-8 rounded border border-[var(--dash-border)]"
              title="Color"
            />
            <button
              type="button"
              onClick={() => onUpdate({ fontWeight: element.fontWeight >= 600 ? 400 : 700 })}
              title="Bold"
              className={element.fontWeight >= 600 ? iconButtonActiveClass : iconButtonClass}
            >
              <Bold className="h-4 w-4" aria-hidden="true" />
            </button>
            {(
              [
                { value: "left", Icon: AlignLeft },
                { value: "center", Icon: AlignCenter },
                { value: "right", Icon: AlignRight },
              ] as const
            ).map(({ value, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => onUpdate({ textAlign: value })}
                title={`Align ${value}`}
                className={element.textAlign === value ? iconButtonActiveClass : iconButtonClass}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <label
              className="flex items-center gap-1 rounded-md border border-[var(--dash-border)] px-1.5 py-1 text-xs text-[var(--dash-text-muted)]"
              title="Line height"
            >
              <AlignVerticalSpaceAround className="h-3.5 w-3.5" aria-hidden="true" />
              <input
                type="number"
                step={0.05}
                min={0.5}
                value={element.lineHeight}
                onChange={(event) => onUpdate({ lineHeight: Number(event.target.value) || 1 })}
                className="w-12 bg-transparent text-xs text-[var(--dash-text)] outline-none"
              />
            </label>
            <label
              className="flex items-center gap-1 rounded-md border border-[var(--dash-border)] px-1.5 py-1 text-xs text-[var(--dash-text-muted)]"
              title="Letter spacing (px)"
            >
              <MoveHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              <input
                type="number"
                step={0.5}
                value={element.letterSpacing}
                onChange={(event) => onUpdate({ letterSpacing: Number(event.target.value) || 0 })}
                className="w-12 bg-transparent text-xs text-[var(--dash-text)] outline-none"
              />
            </label>
          </div>
        </>
      )}

      <div className="flex items-center gap-1.5">
        <label
          className="flex items-center gap-1 rounded-md border border-[var(--dash-border)] px-1.5 py-1 text-xs text-[var(--dash-text-muted)]"
          title="Entrance animation duration (seconds)"
        >
          <Play className="h-3.5 w-3.5" aria-hidden="true" />
          <input
            type="number"
            step={0.1}
            min={0}
            max={3}
            value={element.animationDuration ?? 0}
            onChange={(event) => onUpdate({ animationDuration: Number(event.target.value) || undefined })}
            className="w-10 bg-transparent text-xs text-[var(--dash-text)] outline-none"
          />
          s
        </label>
        {!!element.animationDuration && (
          <button type="button" onClick={onPreviewAnimation} title="Preview animation" className={iconButtonClass}>
            <Play className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 border-t border-[var(--dash-border)] pt-1.5">
        <button type="button" onClick={() => onReorder("front")} title="Bring to front" className={iconButtonClass}>
          <BringToFront className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => onReorder("forward")} title="Bring forward" className={iconButtonClass}>
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => onReorder("backward")} title="Send backward" className={iconButtonClass}>
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => onReorder("back")} title="Send to back" className={iconButtonClass}>
          <SendToBack className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="mx-0.5 h-5 w-px bg-[var(--dash-border)]" />
        <button type="button" onClick={onDuplicate} title="Duplicate" className={iconButtonClass}>
          <Copy className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          title="Delete"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
