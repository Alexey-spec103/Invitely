import type { BackgroundFill } from "@/lib/backgroundFills";

/** Design-space width every CanvasFrame is authored at. The renderer scales
 * this down (or up) to fit the real viewport rather than reflowing content —
 * elements keep their relative layout on any screen size. */
export const CANVAS_DESIGN_WIDTH = 1200;

export type CanvasElementType = "text" | "image" | "video" | "qr";

export interface CanvasElementBase {
  id: string;
  type: CanvasElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  /** Excluded from the public site and PDF, but still shown (dimmed) in the
   * editor so a host can bring it back later -- the layers panel's eye toggle. */
  hidden?: boolean;
  /** Excluded on narrow viewports on the public site (CSS media query).
   * Ignored by the PDF renderer -- paper has no "mobile" concept. */
  desktopOnly?: boolean;
  /** Seconds for a fade+rise-in entrance animation when this element scrolls
   * into view on the public site. Undefined/0 = no animation (existing
   * saved frames render exactly as before). Ignored by the PDF renderer. */
  animationDuration?: number;
}

export interface CanvasTextElement extends CanvasElementBase {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  textAlign: "left" | "center" | "right";
  lineHeight: number;
  letterSpacing: number;
}

export interface CanvasImageElement extends CanvasElementBase {
  type: "image";
  imageUrl: string;
  objectFit: "cover" | "contain";
  borderRadius: number;
  filter?: string;
}

export interface CanvasVideoElement extends CanvasElementBase {
  type: "video";
  videoUrl: string;
  objectFit: "cover" | "contain";
  borderRadius: number;
}

// A QR element never carries its own image data -- what it should encode
// depends on who's looking at it (a specific guest's personal invite link,
// or just the event's public site), so it's resolved into a real scannable
// image only at output time (see lib/canvas/resolveQrElements.ts), not
// stored here. This is what lets the same element render correctly in a
// generic (non-personalized) export and a per-guest one.
export interface CanvasQrElement extends CanvasElementBase {
  type: "qr";
  source: "inviteLink" | "siteLink";
  caption?: string;
}

export type CanvasElement = CanvasTextElement | CanvasImageElement | CanvasVideoElement | CanvasQrElement;

export interface CanvasFrame {
  id: string;
  name: string;
  width: typeof CANVAS_DESIGN_WIDTH;
  height: number;
  background: {
    /** Legacy plain solid color, from before B12's shared background
     * library existed -- still rendered as a fallback when `fill` is unset,
     * so frames saved before this field existed keep rendering unchanged.
     * The BackgroundPicker UI no longer writes to this field directly (a
     * color chosen there becomes `fill: {kind: "color", ...}` instead, so
     * opacity applies uniformly across color/gradient/texture). */
    color?: string;
    /** The host's own uploaded photo -- a full-cover image fill, mutually
     * exclusive with `fill` in the editor UI (picking one clears the other)
     * since only one background can show at once. */
    imageUrl?: string;
    /** Color/gradient/texture fill from the shared background library
     * (lib/backgroundFills.ts) -- undefined for every frame saved before
     * B12, which keeps rendering from `color`/`imageUrl` exactly as before. */
    fill?: BackgroundFill;
  };
  elements: CanvasElement[];
}
