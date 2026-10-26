"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Moveable from "react-moveable";
import type { OnDrag, OnResize, OnRotate } from "react-moveable";
import { CANVAS_DESIGN_WIDTH, type CanvasElement, type CanvasFrame } from "@/lib/canvas/types";
import { ensureCanvasFontLoaded, canvasFontFamiliesFor, canvasFontFamilyCss } from "@/lib/canvas/fonts";
import { uploadEventPhoto } from "@/lib/photoUpload";
import { uploadEventVideo } from "@/lib/videoUpload";
import type { BackgroundFill } from "@/lib/backgroundFills";
import BackgroundLayer from "@/components/background/BackgroundLayer";
import { Layers, QrCode, Redo2, Undo2, X } from "lucide-react";
import LayersPanel from "./LayersPanel";
import ElementToolbar from "./ElementToolbar";
import AddElementModal from "./AddElementModal";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

export interface CanvasFrameEditorProps {
  frame: CanvasFrame;
  /** Applies `updater` to this frame and commits the result -- the host owns
   * what "commit" means (a full multi-page site's undo history, or a single
   * print-card frame's own small one), this component only ever edits the
   * one frame it was given.
   *
   * `coalesceKey`, when passed, tells the host "if the last call also
   * carried this same key within the last ~800ms, replace that history
   * entry instead of pushing a new one" -- for a text/number field being
   * typed into, where each keystroke calling this separately would
   * otherwise mean Ctrl+Z only reverts the last keystroke instead of the
   * whole edit. Omit it (as every drag/resize/rotate/nudge/reorder call
   * already does) and every call pushes its own entry, unchanged from
   * before. */
  onUpdateFrame: (updater: (frame: CanvasFrame) => CanvasFrame, coalesceKey?: string) => void;
  onUndo: () => void;
  canUndo: boolean;
  onRedo: () => void;
  canRedo: boolean;
  /** Rendered at the right end of the toolbar row -- each host wires its own
   * persistence UI (a Save button + status, autosave, etc.), since how and
   * when a frame actually gets saved differs per host. */
  toolbarRight?: ReactNode;
  /** Rendered directly under the toolbar row -- e.g. a host's page-tabs
   * strip. This component has no concept of "other frames" at all. */
  belowToolbar?: ReactNode;
  /** Optional, defaults to English -- same pattern as the other canvas
   * sub-components (AddElementModal/LayersPanel/ElementToolbar/FontPicker),
   * threaded down to all of them. */
  locale?: Locale;
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

function defaultTextElement(newTextDefault: string): CanvasElement {
  return {
    id: makeId(),
    type: "text",
    x: 80,
    y: 80,
    width: 300,
    height: 60,
    rotation: 0,
    zIndex: 1,
    text: newTextDefault,
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

function defaultQrElement(): CanvasElement {
  return {
    id: makeId(),
    type: "qr",
    x: 80,
    y: 80,
    width: 160,
    height: 160,
    rotation: 0,
    zIndex: 1,
    source: "siteLink",
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

/** Everything needed to edit the elements of ONE CanvasFrame -- selection,
 * drag/resize/rotate, the floating property toolbar, the layers panel,
 * background, add-element flow. Deliberately has no idea "other frames"
 * exist; a host that manages several frames (like the site's own canvas
 * editor) owns that separately and just hands this component whichever one
 * is currently active. */
export default function CanvasFrameEditor({
  frame,
  onUpdateFrame,
  onUndo,
  canUndo,
  onRedo,
  canRedo,
  toolbarRight,
  belowToolbar,
  locale,
}: CanvasFrameEditorProps) {
  const t = getDictionary(locale ?? "en").dashboard.paper.canvas;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
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
  // dashboard-audit.md Block: mobile-responsive pass. LayersPanel's own
  // fixed w-64 width, permanently beside the canvas at every viewport size,
  // was leaving the canvas a barely-visible sliver on a 375px screen (its
  // own scale computation below floors at 0.2). Below `sm:` the panel is now
  // a slide-in drawer instead of a permanent sidebar -- closed by default so
  // the canvas gets full width; `sm:` and up render it exactly as before via
  // the CSS classes on its wrapper, no behavior change on desktop.
  const [layersOpen, setLayersOpen] = useState(false);

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
    const toolbarWidth = toolbarEl?.offsetWidth ?? 0;
    const gap = 8;

    // dashboard-audit.md: this editor also gets embedded at a fixed height
    // next to a permanent Layers sidebar (Paper tab), where the available
    // width -- and so canvasScale, which is width-only -- can shrink the
    // rendered card well under the toolbar's own (deliberately unscaled, see
    // above) height. The old "below the element" fallback stayed inside the
    // element's own card, which on a card that short meant burying whatever
    // other elements sat further down. Falling back to the CARD's bottom
    // edge instead of the element's keeps the "above" placement unchanged
    // (the common, spacious case) while guaranteeing the fallback never
    // overlaps sibling elements, however small the card has been scaled to.
    const spaceAbove = rect.top - containerRect.top + scrollAreaEl.scrollTop;
    const fitsAbove = spaceAbove - toolbarHeight - gap >= scrollAreaEl.scrollTop;
    const cardRect = canvasAreaEl?.getBoundingClientRect() ?? null;
    const cardBottom = cardRect ? cardRect.bottom - containerRect.top + scrollAreaEl.scrollTop : null;

    const rawTop = fitsAbove
      ? spaceAbove - toolbarHeight - gap
      : (cardBottom ?? rect.bottom - containerRect.top + scrollAreaEl.scrollTop) + gap;
    // dashboard critique (2026-10-23), fifth re-run P1 (continued): the
    // "below the card" fallback above was written back when this editor was
    // always scaled down well under its own scroll viewport, so the card's
    // bottom edge was always close by. Once the embedded width cap was
    // lifted (Paper's editor now scales close to 1:1, same as Site's),
    // confirmed live: a card taller than the viewport put that fallback
    // 1000+px below the current scroll position -- the toolbar rendered,
    // but nowhere the host could see or reach it. Clamping into the
    // CURRENT visible scroll window (not just the horizontal clamp below)
    // guarantees it always lands somewhere on screen, whatever the card's
    // own height turns out to be.
    const minTop = scrollAreaEl.scrollTop + gap;
    const maxTop = scrollAreaEl.scrollTop + scrollAreaEl.clientHeight - toolbarHeight - gap;
    // dashboard critique (2026-10-24), sixth re-run: the clamp above keeps
    // the toolbar inside the canvas's OWN scrollable bounds, but when this
    // editor is embedded mid-page (Paper), the canvas's scroll area can
    // itself be taller than what's currently visible in the browser window
    // -- confirmed live, a position still "inside scrollAreaEl" measured
    // 118px below window.innerHeight at one page-scroll position. A second
    // clamp, converting content-relative top into what's actually on
    // screen right now (containerRect.top - scrollTop is where content-y=0
    // currently sits in viewport coordinates), catches that case the first
    // clamp can't see.
    // dashboard critique (2026-10-24), seventh re-run: confirmed by source
    // analysis -- contentOriginInViewport already subtracts scrollTop once
    // (it's "what viewport-Y does content-position 0 currently map to");
    // the two lines below were then adding scrollTop back a SECOND time,
    // so the clamp only matched reality when scrollAreaEl.scrollTop was 0.
    // Any time a host had scrolled within a tall card (the normal case),
    // the inflated bound silently lost to maxTop/minTop above and the
    // toolbar could clip up to ~2x scrollTop off-screen. No `+ scrollTop`
    // belongs on either line -- viewport_Y(P) = contentOriginInViewport + P
    // is already the complete conversion.
    const contentOriginInViewport = containerRect.top - scrollAreaEl.scrollTop;
    const viewportMinTop = gap - contentOriginInViewport;
    const viewportMaxTop = window.innerHeight - toolbarHeight - gap - contentOriginInViewport;
    const combinedMin = Math.max(minTop, viewportMinTop);
    const combinedMax = Math.min(maxTop, viewportMaxTop);
    // If the two constraints can't both be satisfied (toolbar genuinely
    // taller than the visible slice of the canvas), keep it on screen --
    // that matters more than staying inside the canvas's own bounds.
    const top =
      combinedMin <= combinedMax
        ? Math.max(combinedMin, Math.min(rawTop, combinedMax))
        : Math.max(viewportMinTop, Math.min(rawTop, viewportMaxTop));
    // Clamped so the popover always stays fully inside the visible scroll
    // area horizontally -- on a narrow viewport the toolbar can be close to
    // the full container width, so an unclamped left (matching wherever the
    // selected element happens to sit) used to push most of it off-screen.
    const rawLeft = rect.left - containerRect.left + scrollAreaEl.scrollLeft;
    const minLeft = scrollAreaEl.scrollLeft + gap;
    const maxLeft = scrollAreaEl.scrollLeft + scrollAreaEl.clientWidth - toolbarWidth - gap;
    const left = Math.max(minLeft, Math.min(rawLeft, maxLeft));
    setToolbarPos({ top, left });
  }, [selectedTarget, scrollAreaEl, toolbarEl, canvasAreaEl]);

  useEffect(() => {
    const id = setTimeout(recomputeToolbarPos, 0);
    return () => clearTimeout(id);
  }, [recomputeToolbarPos]);

  useEffect(() => {
    if (!scrollAreaEl) return;
    // dashboard critique (2026-10-24), sixth re-run: the viewport-aware
    // clamp above reads scrollAreaEl's position relative to the browser
    // window, which moves when the PAGE scrolls (this editor is embedded
    // mid-page in Paper, not the only thing on screen) -- not just when
    // the canvas's own internal area scrolls. `{ passive: true }` + the
    // capture phase so this fires on ANY ancestor's scroll, not only a
    // bubbling scroll on window itself (page scroll containers vary).
    scrollAreaEl.addEventListener("scroll", recomputeToolbarPos);
    window.addEventListener("resize", recomputeToolbarPos);
    window.addEventListener("scroll", recomputeToolbarPos, { passive: true, capture: true });
    return () => {
      scrollAreaEl.removeEventListener("scroll", recomputeToolbarPos);
      window.removeEventListener("resize", recomputeToolbarPos);
      window.removeEventListener("scroll", recomputeToolbarPos, { capture: true });
    };
  }, [scrollAreaEl, recomputeToolbarPos]);

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

  // Entering edit mode renders the element's own `{editingId === element.id
  // ? null : element.text}` JSX children below -- intentional, so React
  // stops reconciling text nodes it no longer controls once the browser's
  // native contentEditable takes over keystrokes. But that same children
  // swap (string -> null) also wipes whatever text was already in the DOM
  // at the exact moment double-click sets `editingId`, before this effect
  // runs -- confirmed live: double-clicking existing text cleared it
  // instantly, and the field never even received focus (no explicit
  // .focus() call existed anywhere), so Ctrl+A/typing fell through to the
  // page instead of the field. This effect re-seeds the live DOM node with
  // the element's actual text once React has committed the null-children
  // render, then focuses it with the cursor parked at the end -- restoring
  // the double-click-to-edit flow editors normally guarantee.
  useEffect(() => {
    if (!editingId) return;
    const node = elementRefs.current[editingId];
    const el = frame.elements.find((e) => e.id === editingId);
    if (!node || !el || el.type !== "text") return;
    node.textContent = el.text;
    node.focus();
    const range = document.createRange();
    range.selectNodeContents(node);
    range.collapse(false);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId]);

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
        canvasFontFamiliesFor(el.fontFamily).forEach(ensureCanvasFontLoaded);
      }
    }
  }, [frame]);

  const updateElement = useCallback(
    (id: string, patch: Partial<CanvasElement>, coalesceKey?: string) => {
      onUpdateFrame(
        (f) => ({
          ...f,
          elements: f.elements.map((el) => (el.id === id ? ({ ...el, ...patch } as CanvasElement) : el)),
        }),
        // Scoped to the element too, not just the field -- switching which
        // element is selected must never coalesce into a DIFFERENT
        // element's edit just because both happened to touch "fontSize"
        // within the same 800ms window.
        coalesceKey ? `${id}:${coalesceKey}` : undefined
      );
    },
    [onUpdateFrame]
  );

  const addText = () => {
    const el = defaultTextElement(t.newTextDefault);
    onUpdateFrame((f) => ({ ...f, elements: [...f.elements, el] }));
    setSelectedId(el.id);
  };

  const addQr = () => {
    const el = defaultQrElement();
    onUpdateFrame((f) => ({ ...f, elements: [...f.elements, el] }));
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
      onUpdateFrame((f) => ({ ...f, elements: [...f.elements, el] }));
      setSelectedId(el.id);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t.couldntUploadPhoto);
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
      onUpdateFrame((f) => ({ ...f, elements: [...f.elements, el] }));
      setSelectedId(el.id);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t.couldntUploadVideo);
    } finally {
      setUploadingVideo(false);
    }
  };

  const updateBackground = useCallback(
    (patch: Partial<CanvasFrame["background"]>) => {
      onUpdateFrame((f) => ({ ...f, background: { ...f.background, ...patch } }));
    },
    [onUpdateFrame]
  );

  // dashboard-audit.md B12: a library fill and the host's own uploaded photo
  // are mutually exclusive in the UI (only one background can actually show
  // at once) -- picking one clears the other, rather than leaving a stale
  // value that silently reappears if the other is later cleared.
  const handleBackgroundFillChange = useCallback(
    (fill: BackgroundFill | undefined) => {
      updateBackground({
        fill,
        imageUrl: fill ? undefined : frame.background.imageUrl,
        color: fill ? undefined : frame.background.color,
      });
    },
    [updateBackground, frame.background.imageUrl, frame.background.color]
  );

  const handleBackgroundFileChosen = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    setUploadingBackground(true);
    try {
      const url = await uploadEventPhoto(file);
      updateBackground({ imageUrl: url, fill: undefined });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t.couldntUploadPhoto);
    } finally {
      setUploadingBackground(false);
    }
  };

  // dashboard critique (2026-10-24), seventh re-run P3: deleting an
  // element here was already fully reversible (onUpdateFrame feeds the
  // host's own undo history, same as every other edit -- Ctrl+Z already
  // worked) but said nothing on screen when it happened, unlike guest and
  // theme deletion elsewhere in the product, which both show a toast.
  // Deliberately NOT the delayed-real-mutation pattern those use (guest/
  // theme removal defer an actual server delete behind the toast's
  // window) -- there's no server round-trip here, the frame's own undo
  // stack already has the entry the instant this runs, so the toast is
  // purely informational: confirm it happened, name the key that reverses
  // it, auto-dismiss.
  const deletedToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showDeletedToast, setShowDeletedToast] = useState(false);
  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    onUpdateFrame((f) => ({ ...f, elements: f.elements.filter((el) => el.id !== selectedId) }));
    setSelectedId(null);
    if (deletedToastTimeoutRef.current) clearTimeout(deletedToastTimeoutRef.current);
    setShowDeletedToast(true);
    deletedToastTimeoutRef.current = setTimeout(() => setShowDeletedToast(false), 3000);
  }, [selectedId, onUpdateFrame]);

  useEffect(() => {
    return () => {
      if (deletedToastTimeoutRef.current) clearTimeout(deletedToastTimeoutRef.current);
    };
  }, []);

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
    onUpdateFrame((f) => ({ ...f, elements: [...f.elements, copy] }));
    setSelectedId(copy.id);
  }, [selectedElement, frame, onUpdateFrame]);

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

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isEditingText = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (isEditingText) return;
      // Ctrl/Cmd+Z undoes, Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y redoes -- the
      // toolbar buttons already call these same onUndo/onRedo props, this
      // just gives the standard shortcut the same effect.
      const isUndoKey = (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "z";
      const isRedoKey = (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "y";
      if (isUndoKey || isRedoKey) {
        event.preventDefault();
        if ((isUndoKey && event.shiftKey) || isRedoKey) {
          if (canRedo) onRedo();
        } else if (canUndo) {
          onUndo();
        }
        return;
      }
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
  }, [selectedId, selectedElement, deleteSelected, updateElement, canUndo, canRedo, onUndo, onRedo]);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {showDeletedToast && (
        // Fixed to the viewport, like every other toast in this product
        // (theme-switch, guest removal) -- not absolute within the
        // scrollable editor area, which would reintroduce the same
        // scroll-position-dependent visibility problem the floating
        // element-toolbar just had fixed above.
        //
        // dashboard critique (2026-10-24), eighth re-run P2: this used to
        // be text-only ("...Ctrl+Z to undo") -- fine for a keyboard-first
        // host, nothing for anyone who doesn't know or can't use the
        // shortcut (touch/tablet, a panicked non-power-user). A real
        // button covers both: clicking it undoes the same way Ctrl+Z
        // does (same onUndo prop), and the still-live keyboard shortcut
        // keeps working for whoever already reaches for it.
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
          <div
            role="status"
            className="pointer-events-auto flex items-center gap-3 rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3.5 py-1.5 text-xs font-medium text-[var(--dash-text)] shadow-lg"
          >
            <span>{t.elementDeletedToast}</span>
            <button
              type="button"
              onClick={() => {
                onUndo();
                setShowDeletedToast(false);
              }}
              className="font-semibold text-[var(--dash-accent-ink)] hover:underline"
            >
              {t.undo}
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-none flex-wrap items-center gap-2 border-b border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 py-2">
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          disabled={uploadingImage}
          className="rounded-md bg-[var(--dash-accent-text)] px-3 py-1.5 text-sm font-medium text-[var(--dash-accent-contrast)] hover:bg-[var(--dash-accent)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploadingImage ? t.uploading : t.addElement}
        </button>

        <span className="mx-2 h-5 w-px bg-[var(--dash-border)]" />

        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title={`${t.undo} (Ctrl+Z)`}
          className="rounded-md border border-[var(--dash-border)] p-1.5 text-[var(--dash-text-muted)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent-ink)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Undo2 className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          title={`${t.redo} (Ctrl+Shift+Z)`}
          className="rounded-md border border-[var(--dash-border)] p-1.5 text-[var(--dash-text-muted)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent-ink)] disabled:cursor-not-allowed disabled:opacity-40"
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

        {/* Shared across image/video element uploads and the background
            upload (LayersPanel shows it a second time, right next to its
            own background controls) -- this copy is the one that's always
            on screen. LayersPanel is a closed-by-default drawer on mobile,
            so a failed element upload (triggered from the toolbar's own
            "+ Add element" modal, nothing to do with the panel) used to
            have nowhere visible to show at all on a phone. */}
        {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}

        <span className="flex-1" />
        {toolbarRight}
      </div>

      {belowToolbar}

      <div className="flex flex-1 overflow-hidden">
        <div ref={setScrollAreaEl} className="relative flex-1 overflow-auto bg-[var(--dash-bg)] p-8">
          {selectedElement && selectedTarget && toolbarPos && editingId !== selectedId && (
            <ElementToolbar
              measureRef={setToolbarEl}
              element={selectedElement}
              position={toolbarPos}
              onUpdate={(patch, coalesceKey) => updateElement(selectedElement.id, patch, coalesceKey)}
              onDuplicate={duplicateSelected}
              onDelete={deleteSelected}
              onReorder={reorderSelected}
              locale={locale}
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
              <BackgroundLayer fill={frame.background.fill} />
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
                          fontFamily: canvasFontFamilyCss(element.fontFamily),
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
                  ) : element.type === "video" ? (
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
                  ) : (
                    // What this actually encodes depends on who's viewing it
                    // (a specific guest vs. the event's own site link), which
                    // only exists at export time -- see resolveCanvasQrElements.
                    // This placeholder is just "yes, a QR code goes here".
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        border: "1px dashed rgba(0,0,0,0.3)",
                        color: "rgba(0,0,0,0.5)",
                        pointerEvents: "none",
                      }}
                    >
                      <QrCode style={{ width: "40%", height: "40%" }} aria-hidden="true" />
                      {element.caption && <span style={{ fontSize: 10 }}>{element.caption}</span>}
                    </div>
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

        {/* Mobile-only floating toggle -- mirrors SupportWidget's established
            floating-round-button pattern (bottom-left, dashboard-wide), just
            the opposite corner so the two never collide. Hidden at `sm:` and
            up, where the panel is already permanently visible. */}
        <button
          type="button"
          onClick={() => setLayersOpen((v) => !v)}
          aria-expanded={layersOpen}
          aria-label={layersOpen ? t.layers.closePanel : t.layers.openPanel}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--dash-accent-text)] text-[var(--dash-accent-contrast)] shadow-lg hover:bg-[var(--dash-accent)] sm:hidden"
        >
          {layersOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Layers className="h-5 w-5" aria-hidden="true" />}
        </button>

        {layersOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 sm:hidden"
            onClick={() => setLayersOpen(false)}
            aria-hidden="true"
          />
        )}

        <div
          className={
            layersOpen
              ? "fixed inset-y-0 right-0 z-40 flex shadow-2xl sm:static sm:z-auto sm:flex sm:shadow-none"
              : "hidden sm:static sm:z-auto sm:flex sm:shadow-none"
          }
        >
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
              onUpdateFrame((f) => ({ ...f, elements: f.elements.filter((e) => e.id !== id) }));
              if (selectedId === id) setSelectedId(null);
            }}
            background={frame.background}
            onBackgroundFillChange={handleBackgroundFillChange}
            onBackgroundImagePick={() => backgroundInputRef.current?.click()}
            onBackgroundImageRemove={() => updateBackground({ imageUrl: undefined })}
            uploadingBackground={uploadingBackground}
            uploadError={uploadError}
            locale={locale}
          />
        </div>
      </div>

      <AddElementModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddText={addText}
        onAddImage={addImage}
        uploadingImage={uploadingImage}
        onAddVideo={addVideo}
        uploadingVideo={uploadingVideo}
        onAddQr={addQr}
        locale={locale}
      />
    </div>
  );
}
