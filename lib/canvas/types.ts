/** Design-space width every CanvasFrame is authored at. The renderer scales
 * this down (or up) to fit the real viewport rather than reflowing content —
 * elements keep their relative layout on any screen size. */
export const CANVAS_DESIGN_WIDTH = 1200;

export type CanvasElementType = "text" | "image" | "video";

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

export type CanvasElement = CanvasTextElement | CanvasImageElement | CanvasVideoElement;

export interface CanvasFrame {
  id: string;
  name: string;
  width: typeof CANVAS_DESIGN_WIDTH;
  height: number;
  background: {
    color?: string;
    imageUrl?: string;
  };
  elements: CanvasElement[];
}
