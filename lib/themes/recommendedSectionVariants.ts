import type { ThemeCategory } from "./types";

/**
 * Same purpose and technique as `recommendedHeroVariantFor` (deterministic
 * per-theme layout pick, no manual switcher needed once Phase 21 removed
 * them from Countdown/Gift/DressCode/Guestbook/Video too) -- kept as
 * separate small per-type maps rather than merged into that file, since each
 * is an independent design call with its own category groupings and this
 * keeps a change to one section type's recommendations from risking a diff
 * next to Hero's already-verified logic.
 */

function stableIndex(seed: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % length;
}

const CATEGORY_COUNTDOWN_VARIANTS: Record<ThemeCategory, string[]> = {
  romantic: ["simple-digits", "circular-rings"],
  modern: ["minimal-inline", "simple-digits"],
  botanical: ["circular-rings", "simple-digits"],
  boho: ["circular-rings", "minimal-inline"],
  luxury: ["circular-rings", "simple-digits"],
  dark: ["minimal-inline", "circular-rings"],
  coastal: ["minimal-inline", "simple-digits"],
  rustic: ["simple-digits", "circular-rings"],
  vintage: ["simple-digits", "circular-rings"],
  minimal: ["minimal-inline", "simple-digits"],
  marble: ["circular-rings", "simple-digits"],
  cosmic: ["circular-rings", "minimal-inline"],
  peony: ["simple-digits", "circular-rings"],
  provence: ["circular-rings", "simple-digits"],
};

export function recommendedCountdownVariantFor(themeId: string, category: ThemeCategory): string {
  const options = CATEGORY_COUNTDOWN_VARIANTS[category];
  return options[stableIndex(themeId, options.length)];
}

const CATEGORY_GIFT_VARIANTS: Record<ThemeCategory, string[]> = {
  romantic: ["simple-list", "minimal-rows"],
  modern: ["compact-badges", "minimal-rows"],
  botanical: ["minimal-rows", "simple-list"],
  boho: ["simple-list", "minimal-rows"],
  luxury: ["compact-badges", "simple-list"],
  dark: ["compact-badges", "minimal-rows"],
  coastal: ["minimal-rows", "compact-badges"],
  rustic: ["simple-list", "minimal-rows"],
  vintage: ["simple-list", "compact-badges"],
  minimal: ["minimal-rows", "compact-badges"],
  marble: ["compact-badges", "simple-list"],
  cosmic: ["compact-badges", "minimal-rows"],
  peony: ["simple-list", "minimal-rows"],
  provence: ["minimal-rows", "simple-list"],
};

export function recommendedGiftVariantFor(themeId: string, category: ThemeCategory): string {
  const options = CATEGORY_GIFT_VARIANTS[category];
  return options[stableIndex(themeId, options.length)];
}

const CATEGORY_DRESS_CODE_VARIANTS: Record<ThemeCategory, string[]> = {
  romantic: ["color-palette", "swatch-grid"],
  modern: ["minimal-stripe", "swatch-grid"],
  botanical: ["swatch-grid", "color-palette"],
  boho: ["color-palette", "swatch-grid"],
  luxury: ["swatch-grid", "minimal-stripe"],
  dark: ["minimal-stripe", "swatch-grid"],
  coastal: ["minimal-stripe", "color-palette"],
  rustic: ["color-palette", "swatch-grid"],
  vintage: ["swatch-grid", "color-palette"],
  minimal: ["minimal-stripe", "color-palette"],
  marble: ["swatch-grid", "minimal-stripe"],
  cosmic: ["minimal-stripe", "swatch-grid"],
  peony: ["color-palette", "swatch-grid"],
  provence: ["swatch-grid", "color-palette"],
};

export function recommendedDressCodeVariantFor(themeId: string, category: ThemeCategory): string {
  const options = CATEGORY_DRESS_CODE_VARIANTS[category];
  return options[stableIndex(themeId, options.length)];
}

const CATEGORY_GUESTBOOK_VARIANTS: Record<ThemeCategory, string[]> = {
  romantic: ["wall", "quote-scroll"],
  modern: ["minimal-list", "wall"],
  botanical: ["wall", "quote-scroll"],
  boho: ["quote-scroll", "wall"],
  luxury: ["quote-scroll", "minimal-list"],
  dark: ["minimal-list", "wall"],
  coastal: ["wall", "minimal-list"],
  rustic: ["wall", "quote-scroll"],
  vintage: ["quote-scroll", "wall"],
  minimal: ["minimal-list", "wall"],
  marble: ["quote-scroll", "minimal-list"],
  cosmic: ["minimal-list", "quote-scroll"],
  peony: ["wall", "quote-scroll"],
  provence: ["wall", "quote-scroll"],
};

export function recommendedGuestbookVariantFor(themeId: string, category: ThemeCategory): string {
  const options = CATEGORY_GUESTBOOK_VARIANTS[category];
  return options[stableIndex(themeId, options.length)];
}

const CATEGORY_VIDEO_VARIANTS: Record<ThemeCategory, string[]> = {
  romantic: ["framed-polaroid", "embed"],
  modern: ["full-bleed", "embed"],
  botanical: ["framed-polaroid", "embed"],
  boho: ["framed-polaroid", "full-bleed"],
  luxury: ["full-bleed", "embed"],
  dark: ["full-bleed", "embed"],
  coastal: ["embed", "full-bleed"],
  rustic: ["framed-polaroid", "embed"],
  vintage: ["framed-polaroid", "embed"],
  minimal: ["embed", "full-bleed"],
  marble: ["full-bleed", "embed"],
  cosmic: ["full-bleed", "embed"],
  peony: ["framed-polaroid", "embed"],
  provence: ["framed-polaroid", "full-bleed"],
};

export function recommendedVideoVariantFor(themeId: string, category: ThemeCategory): string {
  const options = CATEGORY_VIDEO_VARIANTS[category];
  return options[stableIndex(themeId, options.length)];
}
