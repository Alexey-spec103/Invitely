import type { Theme } from "./types";

// A misty grey-green coastal theme -- softer and more neutral than the
// brighter blues/teals elsewhere in the coastal category, EB Garamond for
// quiet elegance.
export const coastalMistGrey: Theme = {
  id: "coastal-mist-grey",
  name: "Mist Grey",
  category: "coastal",
  season: "summer",
  tags: ["Coastal", "Minimal", "Summer", "Marine"],
  vars: {
    "--theme-bg": "#F0F2F1",
    "--theme-text": "#2A322F",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.30:1 against this theme's own #F0F2F1 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.01:1.
    "--theme-accent": "#759285",
    "--theme-font-heading": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), var(--font-caveat), cursive",
  },
};
