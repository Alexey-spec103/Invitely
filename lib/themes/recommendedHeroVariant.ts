import type { ThemeCategory } from "./types";

/**
 * A few archetype-appropriate Hero layouts per category -- picked
 * deterministically per theme (same `stableIndex` technique as
 * `previewMedia.ts`) so every theme gets a real, fitting default
 * composition instead of every one of 100 themes defaulting to the same
 * "monogram-center" layout regardless of style. Values are plain strings
 * (not `HeroVariant`) so `lib/themes` doesn't depend on `components/sections`;
 * callers validate against `HERO_VARIANTS` the same way `site/page.tsx`
 * already validates any stored variant.
 */
const CATEGORY_HERO_VARIANTS: Record<ThemeCategory, string[]> = {
  romantic: ["monogram-center", "hand-lettering", "editorial-split", "watercolor-bloom"],
  modern: ["editorial-minimal", "minimal-text", "art-deco-crest"],
  botanical: ["botanical-frame", "boho-asymmetric", "signature"],
  boho: ["boho-asymmetric", "hand-lettering", "watercolor-bloom"],
  luxury: ["monogram-crest", "letterpress", "art-deco-crest", "vintage-ornamental"],
  dark: ["photo-full-bleed", "monogram-crest", "art-deco-crest", "gothic-frame", "bare-branch"],
  coastal: ["coastal-wave", "minimal-text", "editorial-minimal"],
  rustic: ["collage-scrapbook", "letterpress", "boho-asymmetric", "folk-ornament"],
  vintage: ["vintage-ornamental", "letterpress", "botanical-frame", "postage-stamp", "victorian-cameo"],
  minimal: ["minimal-text", "editorial-minimal", "monogram-center", "left-aligned", "stacked-grid"],
};

function stableIndex(seed: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % length;
}

export function recommendedHeroVariantFor(themeId: string, category: ThemeCategory): string {
  const options = CATEGORY_HERO_VARIANTS[category];
  return options[stableIndex(themeId, options.length)];
}

/** A second, independent taxonomy axis ("what is this design actually
 * built from") derived from the same recommended Hero variant, rather than
 * hand-tagged per theme -- keeps it truthfully tied to the real
 * composition instead of being an arbitrary label. */
const HERO_VARIANT_LAYOUT_LABEL: Record<string, string> = {
  "monogram-center": "Monogram",
  "photo-full-bleed": "Photo Invitation",
  "minimal-text": "Typography",
  "editorial-split": "Editorial",
  signature: "Classic",
  "editorial-minimal": "Editorial",
  "botanical-frame": "Line Art",
  "hand-lettering": "Hand Lettering",
  letterpress: "Letterpress",
  "art-deco-crest": "Art Deco",
  "watercolor-bloom": "Watercolor",
  "coastal-wave": "Coastal Motif",
  "vintage-ornamental": "Ornamental Frame",
  "boho-asymmetric": "Botanical",
  "monogram-crest": "Monogram",
  "folk-ornament": "Folk Ornament",
  "collage-scrapbook": "Collage",
  "gothic-frame": "Gothic Frame",
  "bare-branch": "Atmospheric",
  "postage-stamp": "Postage Stamp",
  "victorian-cameo": "Cameo Locket",
  "left-aligned": "Typography",
  "stacked-grid": "Grid",
};

export function layoutLabelFor(themeId: string, category: ThemeCategory): string {
  const variant = recommendedHeroVariantFor(themeId, category);
  return HERO_VARIANT_LAYOUT_LABEL[variant] ?? "Classic";
}
