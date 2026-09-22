import type { Theme, ThemeCategory } from "./types";

/**
 * Single source of truth for which category gets which colorful decorative
 * asset, in which slot. Was five separate inline `ASSET_BY_CATEGORY` maps
 * (one per component) before this file existed -- that duplication is what
 * let the same category end up with visually inconsistent choices across
 * sections, and made "what asset does romantic use here?" a five-file
 * search instead of one lookup.
 *
 * Kept as several narrow, purpose-named maps rather than one unified
 * `CategoryDecor` shape: Hero decoration genuinely varies by *variant*, not
 * just category (boho's `WatercolorBloom` uses the spray+lineart pair,
 * while boho's `BohoAsymmetric` uses the full-height vine alone) -- forcing
 * that into one generic "heroPrimary/heroSecondary" field per category would
 * either be wrong for one of the two variants or need a second axis anyway.
 * A map per real usage is honest about that; a single fake-uniform shape
 * would not be.
 *
 * Every map here is `Partial` -- a category with no entry falls back to the
 * original theme-accent-tinted CSS mask in the consuming component, safe
 * for any palette. Adding a category here is how future rollout (Problem 2,
 * step "прогнать по всем темам") extends coverage; no component code needs
 * to change to pick it up.
 */

/** WatercolorBloom (Hero) -- shared by `boho`, `romantic`, and (added once
 * recommendedHeroVariant.ts put `watercolor-bloom` in their pools too)
 * `dark`, `coastal`, `vintage`. First asset replaces the centered `.blob`,
 * second replaces the offset `.sprig`. Each of the newer three reuses the
 * exact same pair as CORNER_PAIR_DECOR below for that category, not a
 * fourth unrelated asset -- one motif per theme, everywhere it shows up. */
export const WATERCOLOR_BLOOM_DECOR: Partial<Record<ThemeCategory, [string, string]>> = {
  boho: ["/patterns/color/boho-color-spray.svg", "/patterns/color/boho-color-lineart.svg"],
  romantic: ["/patterns/color/romantic-color-wreath.svg", "/patterns/color/romantic-color-frame.svg"],
  coastal: ["/patterns/color/coastal-color-spray.svg", "/patterns/color/coastal-color-shell.svg"],
  dark: ["/patterns/color/luxury-color-peonies.svg", "/patterns/color/luxury-color-leaves.svg"],
  vintage: ["/patterns/color/ajour-color-floral.svg", "/patterns/color/oriental-color-star.svg"],
  marble: ["/patterns/color/marble-color-geode.svg", "/patterns/color/marble-color-teal.svg"],
  cosmic: ["/patterns/color/cosmic-color-stars.svg", "/patterns/color/cosmic-color-zodiac.svg"],
  peony: ["/patterns/color/peony-color-burgundy.svg", "/patterns/color/peony-color-terracotta.svg"],
  provence: ["/patterns/color/provence-color-wisteria.svg", "/patterns/color/provence-color-archway.svg"],
};

/** Only `romantic-color-wreath.svg` is a genuine open-center ring -- the
 * "nest the names inside the open middle" trick `.blobColor`'s dead-center
 * placement depends on only works for that one asset. Every other
 * WATERCOLOR_BLOOM_DECOR asset (boho's dried-pampas spray, coastal's
 * starfish cluster, dark's peony branch, vintage's lace scroll) is a solid
 * cluster with no open middle -- confirmed live, TWICE (boho's own
 * "Willow & Rome" and coastal's "Isla & Finn" both had the artwork crossing
 * directly through the names when centered the same way as the wreath).
 * Categories absent here (including `boho`, despite already being live
 * before this was caught) get the off-center corner placement in
 * WatercolorBloom.module.css instead of the centered one. */
export const WATERCOLOR_BLOOM_RING: Partial<Record<ThemeCategory, true>> = {
  romantic: true,
};

/** BohoAsymmetric (Hero) -- shared by `boho`, `botanical`, `rustic`.
 * `boho` gets a single full-height vine (a different composition, see the
 * variant's own comment for why); `rustic` gets a corner pair like the
 * other "small accent" slots below. `botanical` has no entry -- keeps the
 * mask fallback. */
export const BOHO_ASYMMETRIC_VINE_DECOR: Partial<Record<ThemeCategory, string>> = {
  boho: "/patterns/color/boho-color-vine-tall.svg",
};
export const BOHO_ASYMMETRIC_CORNER_DECOR: Partial<Record<ThemeCategory, [string, string]>> = {
  rustic: ["/patterns/color/rustic-color-wildflowers.svg", "/patterns/color/rustic-color-wheat.svg"],
  // Same pair as CORNER_PAIR_DECOR.botanical below -- botanical's own Hero
  // variant pool includes `boho-asymmetric` (recommendedHeroVariant.ts), so
  // reusing the identical cornflower/eucalyptus pair here keeps that one
  // theme's decor to a single motif everywhere it shows up, not a second
  // unrelated asset.
  botanical: ["/patterns/color/watercolor-color-cornflower.svg", "/patterns/color/watercolor-color-eucalyptus.svg"],
};

/** The "cap-above" slot -- Countdown's `CircularRings` and DressCode's
 * `ColorPalette`, both presenting a small ceremonial accent above their
 * content. One asset per category (not a pair).
 *
 * `dark` deliberately reuses the "luxury-color-*" staged assets (see
 * public/patterns/staged/LOG.md's "Тёмный фон / Luxury" batch) -- those
 * were studied from weddingpost.ru's near-black-background cards, which
 * matches this site's `dark` category (all 10 themes near-black) far
 * better than this site's own `luxury` category (a near-even mix of
 * near-black AND pale-blush themes -- see luxury-black-diamond/-rose-gold).
 * `luxury` is left off every map here on purpose: no single fixed-palette
 * asset reads legibly on both halves of that split, and a wrong-contrast
 * asset is worse than the safe accent-tinted mask fallback every unmatched
 * category already gets. */
export const CAP_DECOR: Partial<Record<ThemeCategory, string>> = {
  boho: "/patterns/color/boho-color-lineart.svg",
  romantic: "/patterns/color/romantic-color-wreath.svg",
  rustic: "/patterns/color/rustic-color-wildflowers.svg",
  coastal: "/patterns/color/coastal-color-shell.svg",
  // Not luxury-color-stars.svg here -- confirmed via source inspection it
  // has an opaque navy rectangle (#283950) baked into the vector itself as
  // a background, not a transparent frame; renders as a visible box on any
  // background, confirmed live on dark-crimson-noir's Dress Code cap.
  // cosmic-color-constellation.svg is genuinely transparent (gold lines +
  // stars only) and reads as a small floating accent instead.
  dark: "/patterns/color/cosmic-color-constellation.svg",
  vintage: "/patterns/color/ajour-color-floral.svg",
  // Not a peony asset here -- peony-color-terracotta/-burgundy read as
  // mostly white/cream flowers with small color accents (same "pale
  // flowers vanish" failure the romantic/rustic contrast-fixes in
  // staged/LOG.md exist to describe), confirmed low-contrast live on
  // botanical-fern's pale sage background (bg #EEF1E9, very close in
  // luminance to the asset's own #E4E5DF base fill). watercolor-color-
  // cornflower.svg has genuine deep navy-blue saturation instead.
  // (The `peony` *category* below uses these same two assets successfully
  // -- its own theme palettes were deliberately built deeper/richer than
  // botanical's pale sage specifically to give them room, not guessed.)
  botanical: "/patterns/color/watercolor-color-cornflower.svg",
  marble: "/patterns/color/marble-color-geode.svg",
  cosmic: "/patterns/color/cosmic-color-stars.svg",
  peony: "/patterns/color/peony-color-burgundy.svg",
  provence: "/patterns/color/provence-color-archway.svg",
};

/** The "corner pair" slot -- Letter's `CenteredCard` (bleeds outward past
 * the card edge) and Gift's `SimpleList` (sits inside the section edge).
 * Two distinct assets per category, not the same image mirrored -- a
 * single asset doubled reads as an obvious duplicate at the sizes these
 * render at. */
export const CORNER_PAIR_DECOR: Partial<Record<ThemeCategory, [string, string]>> = {
  boho: ["/patterns/color/boho-color-frame.svg", "/patterns/color/boho-color-lineart.svg"],
  romantic: ["/patterns/color/romantic-color-frame.svg", "/patterns/color/romantic-color-wreath.svg"],
  rustic: ["/patterns/color/rustic-color-wildflowers.svg", "/patterns/color/rustic-color-wheat.svg"],
  coastal: ["/patterns/color/coastal-color-spray.svg", "/patterns/color/coastal-color-shell.svg"],
  dark: ["/patterns/color/luxury-color-peonies.svg", "/patterns/color/luxury-color-leaves.svg"],
  // oriental-color-star.svg, not -mandala.svg -- the mandala came back
  // "fully pale monochrome, no gold came through" per staged/LOG.md and
  // confirmed low-contrast live on vintage-amber-glass's cream background;
  // the star medallion has real gold/deep-green/rust color depth instead.
  vintage: ["/patterns/color/ajour-color-floral.svg", "/patterns/color/oriental-color-star.svg"],
  botanical: ["/patterns/color/watercolor-color-cornflower.svg", "/patterns/color/watercolor-color-eucalyptus.svg"],
  marble: ["/patterns/color/marble-color-geode.svg", "/patterns/color/marble-color-teal.svg"],
  cosmic: ["/patterns/color/cosmic-color-stars.svg", "/patterns/color/cosmic-color-zodiac.svg"],
  peony: ["/patterns/color/peony-color-burgundy.svg", "/patterns/color/peony-color-terracotta.svg"],
  provence: ["/patterns/color/provence-color-wisteria.svg", "/patterns/color/provence-color-archway.svg"],
};

/** `luxury` was deliberately absent from every map above -- its own ~10
 * theme files split roughly evenly between near-black and pale-blush
 * backgrounds (e.g. `luxury-black-diamond` #0A0A0C vs `luxury-rose-gold`
 * #FBF0EC), so a single fixed-palette asset per *category* can't read on
 * both halves. Rather than leave the whole category with no decor at all,
 * this resolves per *theme* instead: computed relative luminance confirms
 * luxury's dark themes (#0A0A0C-#14100E, luminance 0.003-0.011) sit in the
 * same near-black band as the `dark` category's own themes (luminance
 * 0.005-0.009) -- safe to reuse `dark`'s already-verified asset pair
 * exactly. Luxury's light themes (#FAF5EC-#FBF0EC, luminance 0.89-0.94)
 * sit in the same pale-cream/blush band as `romantic`'s own themes
 * (luminance 0.86-0.94) -- and `romantic`'s own CORNER_PAIR_DECOR/CAP_DECOR
 * assets were themselves already contrast-fixed specifically for this kind
 * of pale background (see public/patterns/staged/LOG.md's 2026-09-17
 * romantic-color-frame/-hydrangea fixes), so reusing that exact pair here
 * is a well-matched substitution, not a guess. This does mean luxury shares
 * assets with two other categories rather than getting its own -- a
 * deliberate trade-off (a real, already-verified asset beats the
 * accent-tinted mask fallback every unmatched category gets), not an
 * oversight of the "one motif per category" rule the rest of this file
 * follows. */
const LUXURY_DECOR_SUBSTITUTE: Record<"dark" | "light", ThemeCategory> = {
  dark: "dark",
  light: "romantic",
};

/** Same channel-average lightness check `ThemeProvider.tsx`'s `bgLightness`
 * and `backgroundTexture.ts`'s per-theme-lightness overlay pick already use
 * -- kept local (not imported from ThemeProvider, a "use client" component)
 * since this needs to run from both server and client callers. */
function bgLightness(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) return 1;
  const r = parseInt(match[1].slice(0, 2), 16);
  const g = parseInt(match[1].slice(2, 4), 16);
  const b = parseInt(match[1].slice(4, 6), 16);
  return (r + g + b) / 3 / 255;
}

/** The category value every decor lookup in this file should actually be
 * keyed on for a given *theme* -- identical to `theme.category` for every
 * category except `luxury`, which resolves to a same-lightness substitute
 * category instead (see LUXURY_DECOR_SUBSTITUTE above). Call this once at
 * the point a theme's `themeCategory` prop is built for a section, and pass
 * the result on -- every consumer of that prop (CAP_DECOR, CORNER_PAIR_DECOR,
 * etc.) needs no change, since they only ever see a plain ThemeCategory. */
export function effectiveDecorCategory(theme: Theme): ThemeCategory {
  if (theme.category !== "luxury") {
    return theme.category;
  }
  const lightness = bgLightness(theme.vars["--theme-bg"]);
  return lightness < 0.5 ? LUXURY_DECOR_SUBSTITUTE.dark : LUXURY_DECOR_SUBSTITUTE.light;
}

/** `modern` and `minimal` deliberately have no entry in any map above --
 * unlike `luxury`, this isn't a light/dark split problem, it's that no
 * existing Recraft-generated illustration (checked all 25 files in
 * public/patterns/color/) fits either category's own restrained/geometric
 * design language (confirmed already-established and user-approved in
 * backgroundTexture.ts's own minimal/modern texture comment -- "scattering
 * organic shapes here would work against the category's identity"). Rather
 * than leave them with the fully generic laurel-wreath/corner-flourish mask
 * every OTHER unmatched category used to fall back to, these are two
 * hand-authored, single-color, mask-tinted accents (public/patterns/
 * modern-mark.svg, minimal-mark.svg) in the same restrained visual
 * vocabulary as each category's own background texture (modern: small
 * outlined/filled squares, matching modern-grid-mark-scatter.svg; minimal:
 * sparse thin hairlines, matching minimal-hairline-scatter.svg) -- a
 * category-appropriate mask, not a generic fallback, without pretending
 * either category wants the same illustrated-floral treatment every other
 * category got. Only wired where CAP_DECOR/CORNER_PAIR_DECOR's own
 * fallback markup already exists (CircularRings, ColorPalette, CenteredCard)
 * -- WATERCOLOR_BLOOM_DECOR/BOHO_ASYMMETRIC_* stay untouched since neither
 * modern nor minimal's recommendedHeroVariant.ts pool ever selects those
 * Hero variants, so wiring those two maps would add dead entries. */
export const CATEGORY_MASK_ACCENT: Partial<Record<ThemeCategory, string>> = {
  modern: "/patterns/modern-mark.svg",
  minimal: "/patterns/minimal-mark.svg",
};
