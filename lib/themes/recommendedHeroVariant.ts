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
// "photo-full-bleed" ($HERO_VARIANT_LAYOUT_LABEL -> "Photo Invitation") used
// to live only in `dark`, reachable for barely a fraction of its themes via
// `stableIndex` below -- a real, live, filterable gallery option (see
// `layoutLabelFor` + ThemeGallery's "Layout" filter chip) that was
// effectively invisible by accident of distribution, not by design. No
// theme-category decor dependency (PhotoFullBleed.tsx reads only
// names/eventDate/photoUrl/styleOverrides, confirmed by reading it -- unlike
// e.g. boho-asymmetric, which needs `themeCategory` for its illustrated
// vine), so it's safe to add to any category purely on editorial fit: the
// moods where a couple's own full-bleed photo reads as elegant rather than
// fighting an illustrated motif for attention.
const CATEGORY_HERO_VARIANTS: Record<ThemeCategory, string[]> = {
  romantic: ["monogram-center", "hand-lettering", "editorial-split", "watercolor-bloom", "photo-full-bleed"],
  modern: ["editorial-minimal", "minimal-text", "art-deco-crest", "photo-full-bleed"],
  botanical: ["botanical-frame", "boho-asymmetric", "signature", "watercolor-botanical"],
  boho: ["boho-asymmetric", "hand-lettering", "watercolor-bloom"],
  luxury: ["monogram-crest", "letterpress", "art-deco-crest", "vintage-ornamental", "alcohol-ink-gold", "photo-full-bleed"],
  // watercolor-bloom added for dark/coastal/vintage alongside their existing
  // archetypes -- it's the same "colorful wreath framing the names" device
  // romantic uses, gated by category via WATERCOLOR_BLOOM_DECOR, generic
  // enough (a masked blob + a small offset sprig) to not be tied to any one
  // mood. Rolled out once WATERCOLOR_BLOOM_DECOR had real assets for these
  // three categories -- see decorMotifs.ts.
  dark: ["photo-full-bleed", "monogram-crest", "art-deco-crest", "gothic-frame", "bare-branch", "watercolor-bloom"],
  coastal: ["coastal-wave", "minimal-text", "editorial-minimal", "watercolor-bloom"],
  rustic: ["collage-scrapbook", "letterpress", "boho-asymmetric", "folk-ornament"],
  vintage: ["vintage-ornamental", "letterpress", "botanical-frame", "postage-stamp", "victorian-cameo", "watercolor-bloom", "photo-full-bleed"],
  minimal: ["minimal-text", "editorial-minimal", "monogram-center", "left-aligned", "stacked-grid", "photo-full-bleed"],
  marble: ["monogram-crest", "letterpress", "art-deco-crest", "victorian-cameo", "watercolor-bloom", "photo-full-bleed"],
  cosmic: ["monogram-crest", "art-deco-crest", "gothic-frame", "bare-branch", "watercolor-bloom"],
  peony: ["monogram-center", "hand-lettering", "editorial-split", "watercolor-bloom", "photo-full-bleed"],
  provence: ["botanical-frame", "watercolor-botanical", "signature", "watercolor-bloom"],
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
 * composition instead of being an arbitrary label.
 * dashboard-audit.md "fresh eyes" finding #5: "boho-asymmetric" used to map
 * to "Botanical" here too, colliding with the completely separate
 * `botanical` *category* filter chip in ThemeGallery -- same word, same
 * filter row, two unrelated meanings (structural layout vs. color/mood
 * category), which read as a duplicate rather than two different filters. */
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
  "boho-asymmetric": "Asymmetric",
  "monogram-crest": "Monogram",
  "folk-ornament": "Folk Ornament",
  "collage-scrapbook": "Collage",
  "gothic-frame": "Gothic Frame",
  "bare-branch": "Atmospheric",
  "postage-stamp": "Postage Stamp",
  "victorian-cameo": "Cameo Locket",
  "left-aligned": "Typography",
  "stacked-grid": "Grid",
  "watercolor-botanical": "Watercolor",
  "alcohol-ink-gold": "Alcohol Ink",
};

export function layoutLabelFor(themeId: string, category: ThemeCategory): string {
  const variant = recommendedHeroVariantFor(themeId, category);
  return HERO_VARIANT_LAYOUT_LABEL[variant] ?? "Classic";
}
