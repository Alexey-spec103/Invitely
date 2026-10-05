import type { Theme } from "./types";

// A hot sunset-rust boho theme -- more orange/red-leaning than Desert
// Clay's browner clay tone, for a festival-at-dusk register.
export const bohoSunsetRust: Theme = {
  id: "boho-sunset-rust",
  name: "Sunset Rust",
  category: "boho",
  season: "autumn",
  tags: ["Boho", "Warm", "Autumn", "Sunset"],
  vars: {
    "--theme-bg": "#F2E2D2",
    "--theme-text": "#4A2E20",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.71:1 against this theme's own #F2E2D2 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.06:1.
    "--theme-accent": "#C96631",
    "--theme-font-heading": "var(--font-libre-baskerville), var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
