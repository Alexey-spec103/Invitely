import type { Theme } from "./types";

export const peonyChampagneTerracotta: Theme = {
  id: "peony-champagne-terracotta",
  name: "Champagne & Terracotta Peony",
  category: "peony",
  season: "autumn",
  tags: ["Peony", "Romantic", "Autumn"],
  vars: {
    "--theme-bg": "#E6D3B0",
    "--theme-text": "#3E2E1E",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.24:1 against this theme's own #E6D3B0 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.01:1.
    "--theme-accent": "#B36337",
    "--theme-font-heading": "var(--font-fraunces), var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-sacramento), var(--font-caveat), cursive",
  },
};
