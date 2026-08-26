import type { Theme } from "./types";

// A light champagne-and-pearl luxury theme -- Playfair over Cormorant for
// two humanist serifs together, distinct from Ivory & Platinum's cooler,
// sans-paired take on a similarly light palette.
export const luxuryChampagnePearl: Theme = {
  id: "luxury-champagne-pearl",
  name: "Champagne Pearl",
  category: "luxury",
  season: "spring",
  tags: ["Luxury", "Classic", "Spring", "Pearl"],
  vars: {
    "--theme-bg": "#FAF5EC",
    "--theme-text": "#33291F",
    "--theme-accent": "#D8B978",
    "--theme-font-heading": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-bg-texture": "url('/patterns/grain-light.svg')",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
