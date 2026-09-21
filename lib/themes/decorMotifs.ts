import type { ThemeCategory } from "./types";

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
