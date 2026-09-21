import type { Theme } from "./types";

// Pale champagne background with the teal/gold agate pairing, distinct from
// marble-teal-gold's cooler pale-teal base.
export const marbleChampagneTeal: Theme = {
  id: "marble-champagne-teal",
  name: "Champagne & Teal Marble",
  category: "marble",
  season: "summer",
  tags: ["Marble", "Elegant", "Summer"],
  vars: {
    "--theme-bg": "#F3EEDD",
    "--theme-text": "#2A362F",
    "--theme-accent": "#5F8074",
    "--theme-font-heading": "var(--font-cinzel), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
