import type { Theme } from "./types";

// A tan/driftwood coastal theme -- warmer and more rustic than the other
// coastal palettes, Libre Baskerville + Caveat for a beach-cottage feel.
export const coastalDriftwood: Theme = {
  id: "coastal-driftwood",
  name: "Driftwood",
  category: "coastal",
  season: "summer",
  tags: ["Coastal", "Rustic", "Summer", "Marine"],
  vars: {
    "--theme-bg": "#F1EBDF",
    "--theme-text": "#4A4030",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.82:1 against this theme's own #F1EBDF bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.02:1.
    "--theme-accent": "#9B8460",
    "--theme-font-heading": "var(--font-libre-baskerville), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
