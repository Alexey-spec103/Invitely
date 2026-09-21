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

export default function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const texture = BACKGROUND_TEXTURE[theme.category];
  const textureImage =
    texture && texture.overlay && bgLightness(theme.vars["--theme-bg"]) < 0.5 ? texture.overlay : texture?.image;
  const style = {
    ...theme.vars,
    ...(textureImage ? { "--theme-texture-image": `url("${textureImage}")` } : {}),
  } as CSSProperties;
  return (
    <div className={styles.wrapper} style={style}>
      {children}
    </div>
  );
}
