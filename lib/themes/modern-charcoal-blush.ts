import type { Theme } from "./types";

// First theme to pair Space Grotesk (geometric sans) with a dusty rose
// accent -- gives "modern" its own soft-but-structured register, distinct
// from Modern Mono's true monochrome and Nordic Minimal's cooler grey.
export const modernCharcoalBlush: Theme = {
  id: "modern-charcoal-blush",
  name: "Charcoal & Blush",
  category: "modern",
  season: "spring",
  tags: ["Modern", "Minimal", "Spring", "Abstract"],
  vars: {
    "--theme-bg": "#F7F5F3",
    "--theme-text": "#1F1F1F",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.43:1 against this theme's own #F7F5F3 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.01:1.
    "--theme-accent": "#D17373",
    "--theme-font-heading": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-accent": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-script": "var(--font-sacramento), cursive",
  },
};
