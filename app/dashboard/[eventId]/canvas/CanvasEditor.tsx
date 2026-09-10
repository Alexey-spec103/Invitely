"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CANVAS_DESIGN_WIDTH, type CanvasFrame } from "@/lib/canvas/types";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { saveCanvasFrames } from "./actions";
import CanvasFrameEditor from "@/components/canvas/CanvasFrameEditor";

interface CanvasEditorProps {
  eventId: string;
  initialFrames: CanvasFrame[];
  /** dashboard-audit.md Block E part 3: editing and saving stay fully free
   * on every plan -- see saveCanvasFrames, which persists unconditionally.
   * This only drives the banner below, since the actual gate is in
   * app/e/[slug]/page.tsx (public render falls back to the structured
   * layout unless the plan meets Basic, even though the canvas design is
   * saved either way -- never silently discarding real work). */
  hasBasicAccess: boolean;
}

function makeId() {
  return crypto.randomUUID();
}

function defaultFrame(name: string): CanvasFrame {
  return {
    id: makeId(),
    name,
    width: CANVAS_DESIGN_WIDTH,
    height: 800,
    background: { color: "#ffffff" },
    elements: [],
  };
}

/** Manages the site's multi-page canvas (which frame is active, the page
 * tabs, undo/redo history across page-level changes too, and persistence)
 * around CanvasFrameEditor, which owns everything about editing the
 * currently-active frame's own contents. */
export default function CanvasEditor({ eventId, initialFrames, hasBasicAccess }: CanvasEditorProps) {
  const [frames, setFrames] = useState<CanvasFrame[]>(initialFrames);
  const [activeFrameId, setActiveFrameId] = useState<string>(initialFrames[0].id);
  const [history, setHistory] = useState<CanvasFrame[][]>([initialFrames]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSavedTick, setShowSavedTick] = useState(false);

  const frame = useMemo(
    () => frames.find((f) => f.id === activeFrameId) ?? frames[0],
    [frames, activeFrameId]
  );

  const commit = (nextFrames: CanvasFrame[]) => {
    setFrames(nextFrames);
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), nextFrames]);
    setHistoryIndex((idx) => idx + 1);
  };

  const updateActiveFrame = (updater: (f: CanvasFrame) => CanvasFrame) => {
    commit(frames.map((f) => (f.id === activeFrameId ? updater(f) : f)));
  };

  const undo = () => {
    if (historyIndex === 0) return;
    const nextIndex = historyIndex - 1;
    setHistoryIndex(nextIndex);
    setFrames(history[nextIndex]);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    setFrames(history[nextIndex]);
  };

  const addFrame = () => {
    const newFrame = defaultFrame(`Page ${frames.length + 1}`);
    commit([...frames, newFrame]);
    setActiveFrameId(newFrame.id);
  };

  const deleteFrame = (id: string) => {
    if (frames.length <= 1) return;
    if (!window.confirm("Delete this page?")) return;
    const nextFrames = frames.filter((f) => f.id !== id);
    commit(nextFrames);
    if (activeFrameId === id) {
      setActiveFrameId(nextFrames[0].id);
    }
  };

  const moveFrame = (id: string, direction: "left" | "right") => {
    const index = frames.findIndex((f) => f.id === id);
    const swapWith = direction === "left" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= frames.length) return;
    const nextFrames = [...frames];
    [nextFrames[index], nextFrames[swapWith]] = [nextFrames[swapWith], nextFrames[index]];
    commit(nextFrames);
  };

  const renameFrame = (id: string) => {
    const current = frames.find((f) => f.id === id);
    if (!current) return;
    const name = window.prompt("Page name", current.name);
    if (!name) return;
    commit(frames.map((f) => (f.id === id ? { ...f, name } : f)));
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaving(true);
    try {
      await saveCanvasFrames(eventId, frames);
      setShowSavedTick(true);
      setTimeout(() => setShowSavedTick(false), 2000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <CanvasFrameEditor
        key={frame.id}
        frame={frame}
        onUpdateFrame={updateActiveFrame}
        onUndo={undo}
        canUndo={historyIndex > 0}
        onRedo={redo}
        canRedo={historyIndex < history.length - 1}
        toolbarRight={
          <>
            <Link
              href={`/dashboard/${eventId}/site`}
              className="text-xs font-medium text-[var(--dash-text-muted)] hover:text-[var(--dash-accent)]"
            >
              ← Back to Site
            </Link>
            <span className="h-4 w-px bg-[var(--dash-border)]" aria-hidden="true" />
            {saving && (
              <span className="flex items-center gap-1 text-xs text-[var(--dash-text-muted)]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                Saving...
              </span>
            )}
            {!saving && showSavedTick && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Saved
              </span>
            )}
            {saveError && (
              <span className="flex items-center gap-1 text-xs text-red-400">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                {saveError}
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-[var(--dash-accent)] px-4 py-1.5 text-sm font-semibold text-[var(--dash-accent-contrast)] hover:bg-[var(--dash-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save
            </button>
          </>
        }
        belowToolbar={
          <>
          {!hasBasicAccess && (
            <div className="flex flex-none items-center gap-2 border-b border-[var(--dash-border)] bg-[color-mix(in_srgb,var(--dash-accent)_14%,transparent)] px-4 py-1.5 text-xs text-[var(--dash-accent)]">
              🔒 Saves normally — your public site only shows this design once you&apos;re on the
              Basic plan or above.
              <Link href={`/dashboard/${eventId}/plan`} className="font-medium underline">
                Upgrade
              </Link>
            </div>
          )}
          <div className="flex flex-none flex-wrap items-center gap-2 border-b border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 py-2">
            {frames.map((f, index) => (
              <div
                key={f.id}
                className={
                  f.id === activeFrameId
                    ? "flex items-center gap-1 rounded-md bg-[var(--dash-accent)] pl-3 pr-1.5 py-1 text-sm text-[var(--dash-accent-contrast)]"
                    : "flex items-center gap-1 rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface-2)] pl-3 pr-1.5 py-1 text-sm text-[var(--dash-text-muted)] hover:border-[var(--dash-accent)]"
                }
              >
                <button type="button" onClick={() => setActiveFrameId(f.id)} className="max-w-[10rem] truncate">
                  {f.name}
                </button>
                <button
                  type="button"
                  title="Rename page"
                  onClick={() => renameFrame(f.id)}
                  className={f.id === activeFrameId ? "px-1 text-[var(--dash-accent-contrast)]/70 hover:text-[var(--dash-accent-contrast)]" : "px-1 text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"}
                >
                  ✎
                </button>
                <button
                  type="button"
                  title="Move left"
                  disabled={index === 0}
                  onClick={() => moveFrame(f.id, "left")}
                  className={
                    (f.id === activeFrameId ? "text-[var(--dash-accent-contrast)]/70 hover:text-[var(--dash-accent-contrast)]" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]") +
                    " px-1 disabled:opacity-30"
                  }
                >
                  ←
                </button>
                <button
                  type="button"
                  title="Move right"
                  disabled={index === frames.length - 1}
                  onClick={() => moveFrame(f.id, "right")}
                  className={
                    (f.id === activeFrameId ? "text-[var(--dash-accent-contrast)]/70 hover:text-[var(--dash-accent-contrast)]" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]") +
                    " px-1 disabled:opacity-30"
                  }
                >
                  →
                </button>
                {frames.length > 1 && (
                  <button
                    type="button"
                    title="Delete page"
                    onClick={() => deleteFrame(f.id)}
                    className={f.id === activeFrameId ? "px-1 text-[var(--dash-accent-contrast)]/70 hover:text-red-300" : "px-1 text-[var(--dash-text-muted)] hover:text-red-400"}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addFrame}
              className="rounded-md border border-dashed border-[var(--dash-border)] px-3 py-1 text-sm font-medium text-[var(--dash-text-muted)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
            >
              + Page
            </button>
          </div>
          </>
        }
      />
    </div>
  );
}
