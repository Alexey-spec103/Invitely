import type { Theme } from "./types";

// A turquoise-accented boho theme -- straddles boho and coastal, filed as
// boho for the Caveat script and leaf texture rather than the wave motif.
export const bohoTurquoiseTribal: Theme = {
  id: "boho-turquoise-tribal",
  name: "Turquoise Tribal",
  category: "boho",
  season: "summer",
  tags: ["Boho", "Coastal", "Summer", "Turquoise"],
  vars: {
    "--theme-bg": "#EEF3F0",
    "--theme-text": "#263631",
    "--theme-accent": "#4FA089",
    "--theme-font-heading": "var(--font-fraunces), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-bg-texture": "url('/patterns/leaves.svg')",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
