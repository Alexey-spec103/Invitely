import type { ThemeCategory } from "./types";

/**
 * Full-page background texture, per category -- the "expensive paper, not a
 * flat color fill" upgrade (weddingpost.ru reference: a textured backdrop
 * with a raised paper card floating on top, not a solid color behind flat
 * text). Rendered as a real SVG file (not an inline data URI) so it's a
 * normal cacheable asset like every other pattern in `/public/patterns/`.
 *
 * Every texture SVG is alpha-only noise (RGB fixed, only opacity varies),
 * layered as a plain `background-image` on top of `background-color` --
 * simple, and proven to render reliably. The one wrinkle: an alpha-only
 * texture only reads correctly when it darkens-on-light OR lightens-on-dark,
 * never both, so it needs a whole category to sit on one side of light/dark.
 * Every category here does that except `luxury` (own 10 themes split
 * roughly evenly between near-black and pale-blush -- same root cause as
 * why `luxury` has no fixed-palette decor asset in decorMotifs.ts either).
 *
 * `overlay: string` on a category entry means: ThemeProvider computes that
 * *theme's own* `--theme-bg` lightness at render time and picks `image`
 * (tuned for light backgrounds) or `overlay` (tuned for dark ones)
 * accordingly -- adapting per theme instead of per category. (Tried
 * `background-blend-mode: overlay` with one opaque mid-grey texture first;
 * confirmed by hand -- and live, on `luxury-rose-gold` -- that CSS overlay
 * blending is nearly powerless within ~5% of white, since the achievable
 * delta is bounded by `2 * (1 - base) * (1 - texture)`. Two plain alpha
 * textures picked by actual lightness is what to reach for first for any
 * future mixed-lightness category, not overlay blending.)
 *
 * `Partial` like every other map in this directory -- a category with no
 * entry keeps ThemeProvider's plain flat-color background, unchanged.
 * Pilot (2026-09-17): `romantic` only, confirmed live and explicitly
 * approved ("Все получились идеально") before this rolled out to the
 * remaining categories the same day.
 */
export interface BackgroundTexture {
  /** Default texture, or the light-background variant when `overlay` is set. */
  image: string;
  /** Dark-background variant, picked instead of `image` when the theme's
   * own `--theme-bg` is dark. Only `luxury` needs this (see above). */
  overlay?: string;
}

export const BACKGROUND_TEXTURE: Partial<Record<ThemeCategory, BackgroundTexture>> = {
  romantic: { image: "/patterns/texture/paper-grain-warm.svg" },
  // Same seeded-PRNG scatter template: kept the linen weave base, added
  // ~24 small terracotta/rust tribal diamond marks (mulberry32 seed 412) --
  // echoes decorMotifs.ts's earthy boho palette without competing with the
  // much larger vine/pampas corner decor.
  boho: { image: "/patterns/texture/boho-tribal-scatter.svg" },
  // Same seeded-PRNG scatter template as marble/cosmic/luxury -- kept the
  // original grain base, added ~28 small sage/olive leaf silhouettes
  // (mulberry32 seed 88) scattered at low opacity. Replaces the leaf-less
  // paper-grain-botanical.svg pilot; botanical's own decorMotifs.ts assets
  // are corner-only, so this is what gives the open page background itself
  // a "pressed sprig" feel instead of flat grain.
  botanical: { image: "/patterns/texture/botanical-leaf-scatter.svg" },
  // luxury has no fixed-palette *decor* image at all (see decorMotifs.ts --
  // its own 10 themes split too evenly between near-black and pale-blush
  // for one asset to read on both), so a genuinely rich background is this
  // category's main source of visual richness, not a secondary touch.
  // Fine silk-weave grain (same fiber+speckle technique as every other
  // texture here) plus scattered 4-point gold sparkle polygons -- same
  // seeded-PRNG-tile approach as marble's pearls and cosmic's stars, not a
  // flat fleck. Replaces the sparkle-less luxury-fleck-on{light,dark}.svg
  // pilot.
  luxury: { image: "/patterns/texture/luxury-sparkle-onlight.svg", overlay: "/patterns/texture/luxury-sparkle-ondark.svg" },
  // Same technique again: kept the original fiber+speckle grain base, added
  // ~24 small diamond-facet "gem glint" polygons (mulberry32 seed 133, a
  // radial white-to-silver-to-transparent gradient so each reads as a tiny
  // faceted shimmer, not a flat dot). Replaces the glint-less
  // dark-marble-fleck.svg pilot -- fits dark's own onyx/diamond/noir theme
  // names better than plain grain did.
  dark: { image: "/patterns/texture/dark-gem-glint.svg" },
  // Kept the ripple+speckle grain base, added ~26 tiny sand-grain/shell-
  // fleck dots (mulberry32 seed 731, sandy-tan and seafoam-blue tones) --
  // reads as fine beach sand rather than generic noise.
  coastal: { image: "/patterns/texture/coastal-sand-shell-scatter.svg" },
  // Same seeded-PRNG scatter template again: kept the burlap weave base,
  // added ~30 tiny wheat-grain flecks (mulberry32 seed 214, elongated
  // ovals) -- small enough to read as texture, not competing with
  // decorMotifs.ts's much larger corner wheat/wildflower sprigs.
  rustic: { image: "/patterns/texture/rustic-wheat-scatter.svg" },
  // Kept the mottled paper grain base, added ~20 soft blurred "foxing" age
  // spots (mulberry32 seed 305) -- the actual brown-spot mottling real aged
  // paper develops, not just generic noise. Fits vintage better than flat
  // grain without competing with the lace/floral corner decor.
  vintage: { image: "/patterns/texture/vintage-foxing-scatter.svg" },
  // minimal/modern deliberately got the lightest touch of any category in
  // this whole pass (see [[project_new_theme_categories]] / the font-
  // diversity redistribution note above) -- their own design philosophy is
  // restrained/geometric, so scattering organic shapes here would work
  // against the category's identity rather than toward it. Kept each
  // grain base completely unchanged and added only a handful (9 and 11)
  // of near-invisible geometric marks -- hairline ticks for minimal,
  // tiny outline/filled squares for modern -- rather than the same dozens
  // of colorful objects every other category got.
  minimal: { image: "/patterns/texture/minimal-hairline-scatter.svg" },
  modern: { image: "/patterns/texture/modern-grid-mark-scatter.svg" },
  // marble's own 6 themes split light/dark like luxury does -- same
  // per-theme-lightness adaptive pick. Genuine marble "clouds" (low-
  // frequency turbulence, not fine grain) plus scattered pearl circles --
  // confirmed live in weddingpost.ru's own constructor (not just the
  // catalog thumbnail) that their actual Hero background is exactly this:
  // a rich marble/pearl composition, not a flat texture. Replaces the
  // original fine-grain marble-slab-on{light,dark}.svg pilot.
  marble: { image: "/patterns/texture/marble-pearl-onlight.svg", overlay: "/patterns/texture/marble-pearl-ondark.svg" },
  // cosmic's own 6 themes are all near-black (a genuine night sky, not a
  // split like marble/luxury) -- a single lightening layer, no `overlay`
  // variant needed. Real 4-point sparkle-star polygons scattered over the
  // original wisp/fleck grain (same technique as marble's pearls: a
  // seeded PRNG tile, not hand-placed or a repeating grid) -- reads as an
  // actual night sky instead of undifferentiated noise. Replaces the
  // star-less cosmic-nightsky-fleck.svg pilot.
  cosmic: { image: "/patterns/texture/cosmic-nightsky-stars.svg" },
  // Kept the fiber+speckle grain base, added ~22 small burgundy/dusty-rose
  // petal shapes (mulberry32 seed 519) -- echoes decorMotifs.ts's own
  // peony-color-burgundy/-terracotta palette as loose fallen petals.
  peony: { image: "/patterns/texture/peony-petal-scatter.svg" },
  // Kept the fiber+speckle grain base, added ~26 small lavender-purple dots
  // (mulberry32 seed 627) -- a scattered lavender-bud field, echoing
  // decorMotifs.ts's own wisteria/lavender palette (Provence, France).
  provence: { image: "/patterns/texture/provence-lavender-scatter.svg" },
};
