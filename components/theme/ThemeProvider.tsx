"use client";

import type { CSSProperties, ReactNode } from "react";
import type { Theme } from "@/lib/themes/types";
import { BACKGROUND_TEXTURE } from "@/lib/themes/backgroundTexture";
import styles from "./ThemeProvider.module.css";

interface ThemeProviderProps {
  theme: Theme;
  children: ReactNode;
}

/** Relative luminance (0 = black, 1 = white) of a `--theme-bg` hex string --
 * used only to pick BACKGROUND_TEXTURE's light-vs-dark variant per theme
 * (see that file's comment on why `luxury` needs this and nothing else
 * does). Not full sRGB-to-linear luminance -- a plain channel average is
 * more than precise enough for a light/dark texture pick. */
function bgLightness(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) return 1;
  const r = parseInt(match[1].slice(0, 2), 16);
  const g = parseInt(match[1].slice(2, 4), 16);
  const b = parseInt(match[1].slice(4, 6), 16);
  return (r + g + b) / 3 / 255;
}

/** WCAG relative luminance (not bgLightness's plain channel average --
 * precision matters here, this is what actually decides a real contrast
 * ratio, not just a light/dark texture pick). */
function relativeLuminance(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) return 1;
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const r = channel(parseInt(match[1].slice(0, 2), 16));
  const g = channel(parseInt(match[1].slice(2, 4), 16));
  const b = channel(parseInt(match[1].slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: number, b: number): number {
  const [lighter, darker] = a > b ? [a, b] : [b, a];
  return (lighter + 0.05) / (darker + 0.05);
}

/** impeccable audit: several variants (RSVP's submit button, Banquet
 * Navigator's lookup button, Hero's monogram badge) fill with
 * `--theme-accent` and set text to `--theme-bg`, assuming the theme's own
 * background is always light enough for that to read as "white-on-accent".
 * True for high-contrast themes, but several soft/pastel themes (romantic-
 * blush's #C9A96E gold accent on #FBF3EF cream, for one) pick accent and bg
 * close in lightness on purpose for a gentle look -- which makes exactly
 * this pairing illegible (measured 2.0:1 live, needs 4.5:1). Computed once
 * per theme, not hand-tuned per theme file: near-black or near-white,
 * whichever actually passes against this theme's real accent. */
function accentContrastColor(accentHex: string): string {
  const accentLum = relativeLuminance(accentHex);
  const blackContrast = contrastRatio(accentLum, 0);
  const whiteContrast = contrastRatio(accentLum, 1);
  return whiteContrast >= blackContrast ? "#ffffff" : "#1a1a1a";
}

export default function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const texture = BACKGROUND_TEXTURE[theme.category];
  const textureImage =
    texture && texture.overlay && bgLightness(theme.vars["--theme-bg"]) < 0.5 ? texture.overlay : texture?.image;
  const style = {
    ...theme.vars,
    "--theme-accent-contrast": accentContrastColor(theme.vars["--theme-accent"]),
    ...(textureImage ? { "--theme-texture-image": `url("${textureImage}")` } : {}),
  } as CSSProperties;
  return (
    <div className={styles.wrapper} style={style}>
      {children}
    </div>
  );
}
