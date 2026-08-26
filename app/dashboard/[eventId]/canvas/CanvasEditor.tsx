"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Moveable from "react-moveable";
import type { OnDrag, OnResize, OnRotate } from "react-moveable";
import { CANVAS_DESIGN_WIDTH, type CanvasElement, type CanvasFrame } from "@/lib/canvas/types";
import { ensureCanvasFontLoaded } from "@/lib/canvas/fonts";
import { uploadEventPhoto } from "@/lib/photoUpload";
import { uploadEventVideo } from "@/lib/videoUpload";
import { AlertCircle, Check, Loader2, Redo2, Undo2 } from "lucide-react";
import { saveCanvasFrames } from "./actions";
import LayersPanel from "./LayersPanel";
import ElementToolbar from "./ElementToolbar";
import AddElementModal from "./AddElementModal";

interface CanvasEditorProps {
  eventId: string;
  initialFrames: CanvasFrame[];
}

function makeId() {
  return crypto.randomUUID();
}

const ARROW_KEYS: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};

function defaultTextElement(): CanvasElement {
  return {
    id: makeId(),
    type: "text",
    x: 80,
    y: 80,
    width: 300,
    height: 60,
    rotation: 0,
    zIndex: 1,
    text: "New text",
    fontFamily: "Inter",
    fontSize: 24,
    fontWeight: 400,
    color: "#222222",
    textAlign: "left",
    lineHeight: 1.2,
    letterSpacing: 0,
  };
}

function defaultImageElement(imageUrl: string): CanvasElement {
  return {
    id: makeId(),
    type: "image",
    x: 80,
    y: 80,
    width: 300,
    height: 300,
    rotation: 0,
    zIndex: 1,
    imageUrl,
    objectFit: "cover",
    borderRadius: 0,
  };
}

function defaultVideoElement(videoUrl: string): CanvasElement {
  return {
    id: makeId(),
    type: "video",
    x: 80,
    y: 80,
    width: 300,
    height: 300,
    rotation: 0,
    zIndex: 1,
    videoUrl,
    objectFit: "cover",
    borderRadius: 0,
  };
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

export default function CanvasEditor({ eventId, initialFrames }: CanvasEditorProps) {
  const [frames, setFrames] = useState<CanvasFrame[]>(initialFrames);
  const [activeFrameId, setActiveFrameId] = useState<string>(initialFrames[0].id);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [history, setHistory] = useState<CanvasFrame[][]>([initialFrames]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSavedTick, setShowSavedTick] = useState(false);
  const [previewAnimId, setPreviewAnimId] = useState<string | null>(null);
  // react-moveable's `target`/`container` props are read during render, and
  // reading ref.current directly in render is disallowed (the React
  // Compiler flags it). elementRefs stays a ref (only ever read inside the
  // effect below or event handlers, both commit/post-commit, never render);
  // selectedTarget/canvasAreaEl are state so render can read them safely.
  const elementRefs = useRef<Record<string, HTMLElement | null>>({});
  const [selectedTarget, setSelectedTarget] = useState<HTMLElement | null>(null);
  const [canvasAreaEl, setCanvasAreaEl] = useState<HTMLDivElement | null>(null);
  const moveableRef = useRef<Moveable>(null);
  // The canvas is authored at a fixed CANVAS_DESIGN_WIDTH (1200px) -- on a
  // narrow viewport (phone) that would otherwise force horizontal scrolling
  // to reach most of the canvas. Scale the whole frame down to fit, the same
  // approach the read-only public CanvasRenderer already uses, but computed
  // as a real number here (not CSS `scale(calc(...))`) so it can also be
  // handed to Moveable's `zoom` prop -- Moveable measures with
  // getBoundingClientRect, so without `zoom` its drag/resize/rotate math
  // would be off by the same scale factor once the container is shrunk.
  const [scrollAreaEl, setScrollAreaEl] = useState<HTMLDivElement | null>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    if (!scrollAreaEl) return;
    const compute = () => {
      const available = scrollAreaEl.clientWidth - 32; // matches the wrapper's p-8 padding
      setCanvasScale(Math.min(1, Math.max(0.2, available / CANVAS_DESIGN_WIDTH)));
    };
    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(scrollAreaEl);
    return () => observer.disconnect();
  }, [scrollAreaEl]);

  // Floating ElementToolbar position, computed relative to the scroll
  // container (not the transformed/scaled canvas -- the toolbar must stay
  // full-size regardless of canvasScale, matching weddingpost.ru's own
  // popover which never shrinks with the preview zoom). Recomputed on
  // selection change and after drag/resize/rotate settle, not continuously
  // during the interaction itself.
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);
  const [toolbarEl, setToolbarEl] = useState<HTMLDivElement | null>(null);

  const recomputeToolbarPos = useCallback(() => {
    if (!selectedTarget || !scrollAreaEl) {
      setToolbarPos(null);
      return;
    }
    const rect = selectedTarget.getBoundingClientRect();
    const containerRect = scrollAreaEl.getBoundingClientRect();
    const toolbarHeight = toolbarEl?.offsetHeight ?? 0;
    const gap = 8;
    const spaceAbove = rect.top - containerRect.top + scrollAreaEl.scrollTop;
    const top =
      spaceAbove - toolbarHeight - gap >= scrollAreaEl.scrollTop
        ? spaceAbove - toolbarHeight - gap
        : rect.bottom - containerRect.top + scrollAreaEl.scrollTop + gap;
    const left = rect.left - containerRect.left + scrollAreaEl.scrollLeft;
    setToolbarPos({ top, left });
  }, [selectedTarget, scrollAreaEl, toolbarEl]);

  useEffect(() => {
    const id = setTimeout(recomputeToolbarPos, 0);
    return () => clearTimeout(id);
  }, [recomputeToolbarPos]);

  useEffect(() => {
    if (!scrollAreaEl) return;
    scrollAreaEl.addEventListener("scroll", recomputeToolbarPos);
    window.addEventListener("resize", recomputeToolbarPos);
    return () => {
      scrollAreaEl.removeEventListener("scroll", recomputeToolbarPos);
      window.removeEventListener("resize", recomputeToolbarPos);
    };
  }, [scrollAreaEl, recomputeToolbarPos]);

  const frame = useMemo(
    () => frames.find((f) => f.id === activeFrameId) ?? frames[0],
    [frames, activeFrameId]
  );

  useEffect(() => {
    setSelectedTarget(selectedId ? (elementRefs.current[selectedId] ?? null) : null);
  }, [selectedId, frame]);

  // react-moveable measures its target's box when it mounts/updates; if
  // that happens before the target's own layout has settled (e.g. right
  // after a state-driven target swap), the control box can collapse to
  // 0x0 and stay hidden. Forcing a re-measure on the next frame fixes it.
  useEffect(() => {
    if (!selectedTarget) return;
    const raf = requestAnimationFrame(() => {
      moveableRef.current?.updateRect();
    });
    return () => cancelAnimationFrame(raf);
  }, [selectedTarget]);

  const selectedElement = useMemo(
    () => frame.elements.find((el) => el.id === selectedId) ?? null,
    [frame, selectedId]
  );

  // "▶ Preview" button -- plays the entrance animation once on the actual
  // canvas node via the Web Animations API rather than a CSS class, so it
  // never touches the element's own inline style (which already carries its
  // rotation transform) and cleanly reverts when done (default `fill: "none"`).
  useEffect(() => {
    if (!previewAnimId) return;
    const node = elementRefs.current[previewAnimId];
    const el = frame.elements.find((e) => e.id === previewAnimId);
    if (!node || !el?.animationDuration) return;
    node.animate(
      [
        { opacity: 0, transform: "translateY(16px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: el.animationDuration * 1000, easing: "ease-out" }
    );
  }, [previewAnimId, frame]);

  useEffect(() => {
    for (const el of frame.elements) {
      if (el.type === "text") {
        ensureCanvasFontLoaded(el.fontFamily);
      }
    }
  }, [frame]);

  const commit = useCallback(
    (nextFrames: CanvasFrame[]) => {
      setFrames(nextFrames);
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), nextFrames]);
      setHistoryIndex((idx) => idx + 1);
    },
    [historyIndex]
  );

  const updateActiveFrame = useCallback(
    (updater: (f: CanvasFrame) => CanvasFrame) => {
      commit(frames.map((f) => (f.id === activeFrameId ? updater(f) : f)));
    },
    [frames, activeFrameId, commit]
  );

  const updateElement = useCallback(
    (id: string, patch: Partial<CanvasElement>) => {
      updateActiveFrame((f) => ({
        ...f,
        elements: f.elements.map((el) => (el.id === id ? ({ ...el, ...patch } as CanvasElement) : el)),
      }));
    },
    [updateActiveFrame]
  );

  const undo = () => {
    if (historyIndex === 0) return;
    const nextIndex = historyIndex - 1;
    setHistoryIndex(nextIndex);
    setFrames(history[nextIndex]);
    setSelectedId(null);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    setFrames(history[nextIndex]);
    setSelectedId(null);
  };

  const addText = () => {
    const el = defaultTextElement();
    updateActiveFrame((f) => ({ ...f, elements: [...f.elements, el] }));
    setSelectedId(el.id);
  };

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const addImage = () => {
    imageInputRef.current?.click();
  };

  const addVideo = () => {
    videoInputRef.current?.click();
  };

  const handleImageFileChosen = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    setUploadingImage(true);
    try {
      const url = await uploadEventPhoto(file);
      const el = defaultImageElement(url);
      updateActiveFrame((f) => ({ ...f, elements: [...f.elements, el] }));
      setSelectedId(el.id);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Couldn't upload that photo");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVideoFileChosen = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    setUploadingVideo(true);
    try {
      const url = await uploadEventVideo(file);
      const el = defaultVideoElement(url);
      updateActiveFrame((f) => ({ ...f, elements: [...f.elements, el] }));
      setSelectedId(el.id);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Couldn't upload that video");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleBackgroundFileChosen = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    setUploadingBackground(true);
    try {
      const url = await uploadEventPhoto(file);
      updateBackground({ imageUrl: url });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Couldn't upload that photo");
    } finally {
      setUploadingBackground(false);
    }
  };

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    updateActiveFrame((f) => ({ ...f, elements: f.elements.filter((el) => el.id !== selectedId) }));
    setSelectedId(null);
  }, [selectedId, updateActiveFrame]);

  const duplicateSelected = useCallback(() => {
    if (!selectedElement) return;
    const maxZ = frame.elements.length ? Math.max(...frame.elements.map((el) => el.zIndex)) : 1;
    const copy: CanvasElement = {
      ...selectedElement,
      id: makeId(),
      x: selectedElement.x + 16,
      y: selectedElement.y + 16,
      zIndex: maxZ + 1,
    };
    updateActiveFrame((f) => ({ ...f, elements: [...f.elements, copy] }));
    setSelectedId(copy.id);
  }, [selectedElement, frame, updateActiveFrame]);

  const reorderSelected = useCallback(
    (mode: "front" | "back" | "forward" | "backward") => {
      if (!selectedId) return;
      const zValues = frame.elements.map((el) => el.zIndex);
      const maxZ = zValues.length ? Math.max(...zValues) : 1;
      const minZ = zValues.length ? Math.min(...zValues) : 1;
      const sorted = [...frame.elements].sort((a, b) => a.zIndex - b.zIndex);
      const index = sorted.findIndex((el) => el.id === selectedId);

      let nextZ: number;
      if (mode === "front") nextZ = maxZ + 1;
      else if (mode === "back") nextZ = minZ - 1;
      else if (mode === "forward") nextZ = sorted[index + 1]?.zIndex ?? maxZ;
      else nextZ = sorted[index - 1]?.zIndex ?? minZ;

      updateElement(selectedId, { zIndex: nextZ });
    },
    [selectedId, frame, updateElement]
  );

  const updateBackground = useCallback(
    (patch: Partial<CanvasFrame["background"]>) => {
      updateActiveFrame((f) => ({ ...f, background: { ...f.background, ...patch } }));
    },
    [updateActiveFrame]
  );

  const addFrame = () => {
    const newFrame = defaultFrame(`Page ${frames.length + 1}`);
    commit([...frames, newFrame]);
    setActiveFrameId(newFrame.id);
    setSelectedId(null);
  };

  const deleteFrame = (id: string) => {
    if (frames.length <= 1) return;
    if (!window.confirm("Delete this page?")) return;
    const nextFrames = frames.filter((f) => f.id !== id);
    commit(nextFrames);
    if (activeFrameId === id) {
      setActiveFrameId(nextFrames[0].id);
    }
    setSelectedId(null);
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

  const selectFrame = (id: string) => {
    setActiveFrameId(id);
    setSelectedId(null);
    setEditingId(null);
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isEditingText = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (isEditingText) return;
      if ((event.key === "Delete" || event.key === "Backspace") && selectedId) {
        event.preventDefault();
        deleteSelected();
        return;
      }
      // Arrow-key nudge -- the only way to reposition a selected element
      // without dragging, for a host who can't (or doesn't want to) do
      // precise mouse/touch drags.
      const direction = ARROW_KEYS[event.key];
      if (direction && selectedId && selectedElement) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        updateElement(selectedId, {
          x: selectedElement.x + direction[0] * step,
          y: selectedElement.y + direction[1] * step,
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, selectedElement, deleteSelected, updateElement]);

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
      <div className="flex flex-none flex-wrap items-center gap-2 border-b border-gray-200 bg-white px-4 py-2">
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          disabled={uploadingImage}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploadingImage ? "Uploading..." : "+ Add element"}
        </button>

        <span className="mx-2 h-5 w-px bg-gray-200" />

        <button
          type="button"
          onClick={undo}
          disabled={historyIndex === 0}
          title="Undo"
          className="rounded-md border border-gray-300 p-1.5 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Undo2 className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          title="Redo"
          className="rounded-md border border-gray-300 p-1.5 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Redo2 className="h-4 w-4" aria-hidden="true" />
        </button>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => void handleImageFileChosen(event.target.files?.[0])}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(event) => void handleVideoFileChosen(event.target.files?.[0])}
        />
        <input
          ref={backgroundInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => void handleBackgroundFileChosen(event.target.files?.[0])}
        />

        <span className="flex-1" />

        {saving && (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Saving...
          </span>
        )}
        {!saving && showSavedTick && (
          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Saved
          </span>
        )}
        {saveError && (
          <span className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {saveError}
          </span>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-rose-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save
        </button>
      </div>

      <div className="flex flex-none flex-wrap items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2">
        {frames.map((f, index) => (
          <div
            key={f.id}
            className={
              f.id === activeFrameId
                ? "flex items-center gap-1 rounded-md bg-gray-900 pl-3 pr-1.5 py-1 text-sm text-white"
                : "flex items-center gap-1 rounded-md border border-gray-300 bg-white pl-3 pr-1.5 py-1 text-sm text-gray-700 hover:bg-gray-100"
            }
          >
            <button type="button" onClick={() => selectFrame(f.id)} className="max-w-[10rem] truncate">
              {f.name}
            </button>
            <button
              type="button"
              title="Rename page"
              onClick={() => renameFrame(f.id)}
              className={f.id === activeFrameId ? "px-1 text-white/70 hover:text-white" : "px-1 text-gray-400 hover:text-gray-700"}
            >
              ✎
            </button>
            <button
              type="button"
              title="Move left"
              disabled={index === 0}
              onClick={() => moveFrame(f.id, "left")}
              className={
                (f.id === activeFrameId ? "text-white/70 hover:text-white" : "text-gray-400 hover:text-gray-700") +
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
                (f.id === activeFrameId ? "text-white/70 hover:text-white" : "text-gray-400 hover:text-gray-700") +
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
                className={f.id === activeFrameId ? "px-1 text-white/70 hover:text-red-300" : "px-1 text-gray-400 hover:text-red-600"}
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addFrame}
          className="rounded-md border border-dashed border-gray-300 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          + Page
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
      <div ref={setScrollAreaEl} className="relative flex-1 overflow-auto bg-gray-100 p-8">
        {selectedElement && selectedTarget && toolbarPos && editingId !== selectedId && (
          <ElementToolbar
            measureRef={setToolbarEl}
            element={selectedElement}
            position={toolbarPos}
            onUpdate={(patch) => updateElement(selectedElement.id, patch)}
            onDuplicate={duplicateSelected}
            onDelete={deleteSelected}
            onReorder={reorderSelected}
            onPreviewAnimation={() => {
              setPreviewAnimId(null);
              requestAnimationFrame(() => setPreviewAnimId(selectedElement.id));
            }}
          />
        )}
        <div
          style={{
            width: CANVAS_DESIGN_WIDTH * canvasScale,
            height: frame.height * canvasScale,
            margin: "0 auto",
          }}
        >
        <div
          key={frame.id}
          ref={setCanvasAreaEl}
          onMouseDown={(event) => {
            if (event.target === canvasAreaEl) {
              setSelectedId(null);
            }
          }}
          style={{
            position: "relative",
            width: CANVAS_DESIGN_WIDTH,
            height: frame.height,
            transform: `scale(${canvasScale})`,
            transformOrigin: "top left",
            backgroundColor: frame.background.color,
            backgroundImage: frame.background.imageUrl ? `url(${frame.background.imageUrl})` : undefined,
            backgroundSize: "cover",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
          }}
        >
          {frame.elements.map((element) => (
            <div
              key={element.id}
              ref={(node) => {
                elementRefs.current[element.id] = node;
              }}
              onMouseDown={(event) => {
                event.stopPropagation();
                setSelectedId(element.id);
              }}
              onDoubleClick={(event) => {
                event.stopPropagation();
                if (element.type === "text") {
                  setEditingId(element.id);
                }
              }}
              contentEditable={element.type === "text" && editingId === element.id}
              suppressContentEditableWarning
              onBlur={(event) => {
                if (element.type === "text" && editingId === element.id) {
                  setEditingId(null);
                  updateElement(element.id, { text: event.currentTarget.textContent ?? "" });
                }
              }}
              style={{
                position: "absolute",
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
                zIndex: element.zIndex,
                cursor: "move",
                opacity: element.hidden ? 0.35 : 1,
                outline: selectedId === element.id ? "1px solid #e11d48" : "none",
                ...(element.type === "text"
                  ? {
                      fontFamily: element.fontFamily,
                      fontSize: element.fontSize,
                      fontWeight: element.fontWeight,
                      color: element.color,
                      textAlign: element.textAlign,
                      lineHeight: element.lineHeight,
                      letterSpacing: element.letterSpacing,
                      whiteSpace: "pre-wrap",
                      overflow: "hidden",
                    }
                  : {}),
              }}
            >
              {element.type === "text" ? (
                editingId === element.id ? null : element.text
              ) : element.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={element.imageUrl}
                  alt=""
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: element.objectFit,
                    borderRadius: element.borderRadius,
                    pointerEvents: "none",
                  }}
                />
              ) : (
                <video
                  src={element.videoUrl}
                  muted
                  loop
                  autoPlay
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: element.objectFit,
                    borderRadius: element.borderRadius,
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>
          ))}

          {selectedId && editingId !== selectedId && selectedTarget && (
            <Moveable
              ref={moveableRef}
              target={selectedTarget}
              container={canvasAreaEl}
              zoom={canvasScale}
              draggable
              resizable
              rotatable
              throttleDrag={0}
              throttleResize={0}
              throttleRotate={0}
              snappable
              snapDirections={{ left: true, top: true, right: true, bottom: true, center: true, middle: true }}
              elementSnapDirections={{ left: true, top: true, right: true, bottom: true, center: true, middle: true }}
              snapHorizontalThreshold={5}
              snapVerticalThreshold={5}
              horizontalGuidelines={[frame.height / 2]}
              verticalGuidelines={[frame.width / 2]}
              onDrag={({ target, left, top }: OnDrag) => {
                target.style.left = `${left}px`;
                target.style.top = `${top}px`;
              }}
              onDragEnd={({ target }) => {
                updateElement(selectedId, {
                  x: parseFloat(target.style.left) || 0,
                  y: parseFloat(target.style.top) || 0,
                });
                recomputeToolbarPos();
              }}
              onResize={({ target, width, height, drag }: OnResize) => {
                target.style.width = `${width}px`;
                target.style.height = `${height}px`;
                target.style.left = `${drag.left}px`;
                target.style.top = `${drag.top}px`;
              }}
              onResizeEnd={({ target }) => {
                updateElement(selectedId, {
                  width: parseFloat(target.style.width) || 1,
                  height: parseFloat(target.style.height) || 1,
                  x: parseFloat(target.style.left) || 0,
                  y: parseFloat(target.style.top) || 0,
                });
                recomputeToolbarPos();
              }}
              onRotate={({ target, rotate }: OnRotate) => {
                target.style.transform = `rotate(${rotate}deg)`;
              }}
              onRotateEnd={({ target }) => {
                const match = /rotate\(([-\d.]+)deg\)/.exec(target.style.transform);
                updateElement(selectedId, { rotation: match ? parseFloat(match[1]) : 0 });
                recomputeToolbarPos();
              }}
            />
          )}
        </div>
        </div>
      </div>

      <LayersPanel
        elements={frame.elements}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onToggleHidden={(id) => {
          const el = frame.elements.find((e) => e.id === id);
          if (el) updateElement(id, { hidden: !el.hidden });
        }}
        onToggleDesktopOnly={(id) => {
          const el = frame.elements.find((e) => e.id === id);
          if (el) updateElement(id, { desktopOnly: !el.desktopOnly });
        }}
        onDelete={(id) => {
          updateActiveFrame((f) => ({ ...f, elements: f.elements.filter((e) => e.id !== id) }));
          if (selectedId === id) setSelectedId(null);
        }}
        background={frame.background}
        onBackgroundColorChange={(color) => updateBackground({ color })}
        onBackgroundImagePick={() => backgroundInputRef.current?.click()}
        onBackgroundImageRemove={() => updateBackground({ imageUrl: undefined })}
        uploadingBackground={uploadingBackground}
        uploadError={uploadError}
      />
      </div>

      <AddElementModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddText={addText}
        onAddImage={addImage}
        uploadingImage={uploadingImage}
        onAddVideo={addVideo}
        uploadingVideo={uploadingVideo}
      />
    </div>
  );
}
