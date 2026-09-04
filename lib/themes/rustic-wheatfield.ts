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
    "--theme-accent": "#B8862E",
    "--theme-font-heading": "var(--font-fraunces), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
