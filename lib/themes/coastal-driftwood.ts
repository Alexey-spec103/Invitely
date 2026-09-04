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
    "--theme-accent": "#A08966",
    "--theme-font-heading": "var(--font-libre-baskerville), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
