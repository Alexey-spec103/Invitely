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
    "--theme-accent": "#5FA893",
    "--theme-font-heading": "var(--font-fraunces), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-bg-texture": "url('/patterns/waves.svg')",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
