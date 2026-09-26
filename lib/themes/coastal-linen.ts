import type { Theme } from "./types";

// A softer, more elegant coastal register than Coastal Breeze's sans-serif
// take -- EB Garamond headings, for a seaside wedding that wants romance
// more than minimalism.
export const coastalLinen: Theme = {
  id: "coastal-linen",
  name: "Coastal Linen",
  category: "coastal",
  season: "summer",
  tags: ["Coastal", "Minimal", "Summer", "Marine"],
  vars: {
    "--theme-bg": "#F5F2EA",
    "--theme-text": "#2B3A3A",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.60:1 against this theme's own #F5F2EA bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.01:1.
    "--theme-accent": "#6C9393",
    "--theme-font-heading": "var(--font-gilda-display), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-sacramento), cursive",
  },
};
