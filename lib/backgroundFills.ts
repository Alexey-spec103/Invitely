/** dashboard-audit.md B12: weddingpost.ru's "Фон" panels (Site block
 * backgrounds, Canvas/Paper frame backgrounds) offer one shared library --
 * solid colors, gradients, four textures (wood/concrete/marble/linen), and
 * a transparency slider -- rather than each surface inventing its own. This
 * is that shared vocabulary: one `BackgroundFill` value, resolvable to real
 * CSS from a single place, so Canvas/Paper and Site both render identically
 * from the same data shape instead of two parallel implementations drifting
 * apart. Textures are plain CSS `repeating-linear-gradient`s (no image
 * assets) -- an approximation of the real material, in the same spirit as
 * this codebase's other code-drawn visuals (RailIcons, StyleFilterIcons)
 * rather than a licensed photo texture. */

export type BackgroundKind = "color" | "gradient" | "texture";

export interface BackgroundFill {
  kind: BackgroundKind;
  /** Hex color, a CSS gradient() string, or a key into TEXTURES -- which one
   * depends on `kind`. */
  value: string;
  /** 0-100. Undefined means fully opaque (100) -- old data with no opacity
   * field at all still renders exactly as it did before this field existed. */
  opacity?: number;
}

export const COLOR_SWATCHES: string[] = [
  "#ffffff",
  "#faf7f2",
  "#f3ece2",
  "#e8ddcf",
  "#f7e6e6",
  "#f0d3d3",
  "#e3ecdf",
  "#c9d9c2",
  "#dbeef0",
  "#b8d8dc",
  "#e4e1f0",
  "#c7bfe0",
  "#2f2a26",
  "#000000",
];

export const GRADIENT_SWATCHES: { id: string; label: string; css: string }[] = [
  { id: "sunset", label: "Sunset", css: "linear-gradient(135deg, #f6d5a8, #ee9d75)" },
  { id: "blush", label: "Blush", css: "linear-gradient(135deg, #fbe4e6, #f0b8c2)" },
  { id: "sage", label: "Sage", css: "linear-gradient(135deg, #e9f0e3, #b9cdb0)" },
  { id: "dusk", label: "Dusk", css: "linear-gradient(135deg, #ddd6ef, #a89bc9)" },
  { id: "ocean", label: "Ocean", css: "linear-gradient(135deg, #dcf0f2, #9dcdd4)" },
  { id: "champagne", label: "Champagne", css: "linear-gradient(135deg, #f6ecd9, #e0c48f)" },
];

export const TEXTURES: Record<string, { label: string; css: string }> = {
  wood: {
    label: "Wood",
    css: "repeating-linear-gradient(97deg, #a9744f 0px, #8b5e3c 5px, #a9744f 10px, #96683f 16px, #8b5e3c 22px)",
  },
  concrete: {
    label: "Concrete",
    css: "repeating-linear-gradient(45deg, #c7c6c2 0px, #c7c6c2 2px, #bdbcb8 2px, #bdbcb8 4px), repeating-linear-gradient(-45deg, #d2d1cd 0px, #d2d1cd 3px, #c7c6c2 3px, #c7c6c2 6px)",
  },
  marble: {
    label: "Marble",
    css: "repeating-linear-gradient(115deg, #f7f5f1 0px, #ffffff 30px, #e9e4dc 55px, #ffffff 90px, #f2eee7 120px)",
  },
  linen: {
    label: "Linen",
    css: "repeating-linear-gradient(0deg, #ece6d8 0px, #ece6d8 2px, #e1d9c6 2px, #e1d9c6 4px), repeating-linear-gradient(90deg, #ece6d8 0px, #ece6d8 2px, #e1d9c6 2px, #e1d9c6 4px)",
  },
};

/** The raw CSS `background` value for a fill, ignoring opacity -- opacity is
 * applied separately by whoever renders the fill (see BackgroundLayer),
 * since a plain CSS `opacity` on this value alone would also fade whatever
 * it's blended with, not just the fill itself. */
export function backgroundFillCss(fill: BackgroundFill): string | undefined {
  if (fill.kind === "texture") return TEXTURES[fill.value]?.css;
  return fill.value;
}

/** react-pdf has no CSS gradient/pattern support -- only a flat
 * `backgroundColor`. Gradient and texture fills are a deliberate print-export
 * gap (same scope cut as skipping the marble/linen fine-tune gear): they
 * show correctly in the Site/Canvas/Paper editors and on the live public
 * site, but a printed PDF falls back to the frame's legacy solid `color` (or
 * white). A "color"-kind fill *does* export correctly -- blended against an
 * assumed white page underneath, since react-pdf's Page has no further
 * layer for a translucent color to blend against. */
export function pdfBackgroundColor(background: { color?: string; fill?: BackgroundFill }): string {
  if (background.fill?.kind === "color") {
    return blendWithWhite(background.fill.value, background.fill.opacity ?? 100);
  }
  return background.color || "#ffffff";
}

function blendWithWhite(hex: string, opacityPercent: number): string {
  const alpha = Math.max(0, Math.min(100, opacityPercent)) / 100;
  const parsed = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!parsed) return hex;
  const [, r, g, b] = parsed;
  const blend = (channel: string) => Math.round(parseInt(channel, 16) * alpha + 255 * (1 - alpha));
  return `rgb(${blend(r)}, ${blend(g)}, ${blend(b)})`;
}
