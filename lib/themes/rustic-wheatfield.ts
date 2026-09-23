import type { Theme } from "./types";

// A brighter, golden-wheat rustic palette for a summer harvest-style
// wedding -- distinct from Barnwood's darker brown-on-parchment take.
export const rusticWheatfield: Theme = {
  id: "rustic-wheatfield",
  name: "Wheatfield",
  category: "rustic",
  season: "summer",
  tags: ["Rustic", "Botanical", "Summer", "Harvest"],
  vars: {
    "--theme-bg": "#F3EAD4",
    "--theme-text": "#4B4130",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.70:1 against this theme's own #F3EAD4 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.06:1.
    "--theme-accent": "#AC7D2B",
    "--theme-font-heading": "var(--font-fraunces), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
