// Split out of LandingThemeShowcase.tsx (a "use client" component) so the
// Server Component caller (app/page.tsx) can import this plain array too --
// a non-component named export re-exported from a "use client" file becomes
// a client-reference proxy when imported into a Server Component, not the
// real array, which threw "SHOWCASE_THEME_IDS.map is not a function" at
// runtime despite type-checking cleanly. A plain, client-directive-free
// module is importable from both sides.
//
// Hand-picked, not the first N in array order -- spread across the newest
// four categories (marble/cosmic/peony/provence: matched textures, full
// decorative-asset coverage -- see lib/themes/index.ts's POPULAR_THEME_IDS
// comment for why those lead over the original launch batch now) so this
// first-impression teaser reads as "look how rich this is" with real color
// and decorative variety, rather than accidentally clustering one mood.
// 9 (not 6) fills the 3-column grid to a clean 3 rows -- the grid's layout
// is plain repeat(3, ...) with no assumption baked in about the count.
// Opens on a warm, colorful boho pick rather than a dark/moody one (the
// grid reads left-to-right, top-to-bottom, so the very first card sets the
// tone before a visitor even reaches the marble/cosmic entries).
export const SHOWCASE_THEME_IDS = [
  "boho-marigold-festival",
  "marble-noir-rust",
  "peony-blush-burgundy",
  "provence-lavender-sage",
  "marble-champagne-teal",
  "cosmic-plum-gold",
  "peony-terracotta-cream",
  "provence-coral-sage",
  "marble-onyx-sage",
] as const;
