import type { CSSProperties, ReactNode } from "react";
import { fillContrastTextColor, type BackgroundFill } from "@/lib/backgroundFills";
import BackgroundLayer from "./BackgroundLayer";

interface SectionBackgroundProps {
  fill?: BackgroundFill;
  children: ReactNode;
}

/** dashboard-audit.md B12: wraps one Site section's content div with the
 * `position: relative` + behind-content overlay BackgroundLayer needs --
 * factored out since every section in SiteInlineEditor wraps its content
 * the same way, and repeating those three lines at ~10 call sites invites
 * one of them drifting.
 *
 * `isolation: isolate` is the part that's easy to miss and silently breaks
 * everything if it's not there: none of `position: relative`, a section's
 * own `<section>` root, ThemeProvider's wrapper, or the scroll container
 * between here and <body> otherwise establish a stacking context (no
 * transform/opacity/filter on any of them) -- confirmed live, this session,
 * that without `isolation: isolate` here, BackgroundLayer's `z-index: -1`
 * doesn't stop at "behind this section's own content" the way intended. It
 * escapes every one of those un-stacked ancestors and paints at the back of
 * the *entire page*, behind the phone frame's own white chrome and every
 * other section's background too -- invisible, since so many fully opaque
 * ancestor layers sit between it and anything a viewer could see. Confirmed
 * by walking the ancestor chain in devtools (every `position`/`opacity`/
 * `transform` computed style was a no-op) before landing on `isolation` as
 * the fix -- it creates a real stacking context with no other visual
 * side effect, unlike `transform` or `opacity < 1`. */
/** 2026-10-16 critical contrast bug, reported live by a real customer:
 * every section variant's CSS reads `color: var(--theme-text)` at its root
 * (confirmed across all 55 section CSS modules) -- correct for a theme's
 * own default background, but a host-picked custom `fill` (this component's
 * whole job) gets layered on top with zero awareness of that text color.
 * A dark theme's white --theme-text, rendered unchanged over a host-picked
 * white/marble/cream fill, is white-on-white -- the exact "Gift section
 * text invisible" report. fillContrastTextColor computes real contrast and
 * overrides --theme-text locally in this subtree only when it actually
 * needs correcting (returns null for a low-opacity tint or no fill at all,
 * leaving the theme's own already-correct value alone). */
export default function SectionBackground({ fill, children }: SectionBackgroundProps) {
  const textOverride = fill ? fillContrastTextColor(fill) : null;
  return (
    <div
      style={{
        position: "relative",
        isolation: "isolate",
        ...(textOverride ? ({ "--theme-text": textOverride } as CSSProperties) : {}),
      }}
    >
      <BackgroundLayer fill={fill} />
      {children}
    </div>
  );
}
