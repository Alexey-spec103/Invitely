import type { Theme } from "./types";

// A mustard-gold "wildflower field" botanical theme -- warmer and more
// saturated than the green-dominant botanical themes elsewhere.
export const botanicalWildflower: Theme = {
  id: "botanical-wildflower",
  name: "Wildflower",
  category: "botanical",
  season: "summer",
  tags: ["Botanical", "Boho", "Summer", "Wildflower"],
  vars: {
    "--theme-bg": "#F3EFE0",
    "--theme-text": "#423B2A",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.27:1 against this theme's own #F3EFE0 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.01:1.
    "--theme-accent": "#B38037",
    "--theme-font-heading": "var(--font-fraunces), var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-sacramento), var(--font-caveat), cursive",
  },
};
