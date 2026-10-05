import type { Theme } from "./types";

// A green-leaning seafoam coastal theme -- Fraunces headings, distinct
// from the blue-dominant coastal themes elsewhere in the catalog.
export const coastalSeafoamBreeze: Theme = {
  id: "coastal-seafoam-breeze",
  name: "Seafoam Breeze",
  category: "coastal",
  season: "summer",
  tags: ["Coastal", "Botanical", "Summer", "Marine"],
  vars: {
    "--theme-bg": "#EFF6F2",
    "--theme-text": "#223832",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.55:1 against this theme's own #EFF6F2 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.02:1.
    "--theme-accent": "#549A86",
    "--theme-font-heading": "var(--font-fraunces), var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), var(--font-caveat), cursive",
  },
};
