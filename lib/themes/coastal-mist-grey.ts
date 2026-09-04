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
    "--theme-accent": "#8FA69C",
    "--theme-font-heading": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
