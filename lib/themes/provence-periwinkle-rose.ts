import type { Theme } from "./types";

export const provencePeriwinkleRose: Theme = {
  id: "provence-periwinkle-rose",
  name: "Periwinkle & Rose Provence",
  category: "provence",
  season: "spring",
  tags: ["Provence", "Romantic", "Spring"],
  vars: {
    "--theme-bg": "#CFCBE0",
    "--theme-text": "#2C2A42",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.70:1 against this theme's own #CFCBE0 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.02:1.
    "--theme-accent": "#AB5971",
    "--theme-font-heading": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-sacramento), cursive",
  },
};
