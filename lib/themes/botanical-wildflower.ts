import type { Theme } from "./types";

// A mustard-gold "wildflower field" botanical theme -- warmer and more
// saturated than the green-dominant botanical themes elsewhere.
export const botanicalWildflower: Theme = {
  id: "botanical-wildflower",
  name: "Wildflower",
  category: "botanical",
  season: "summer",
  tags: ["Botanical", "Boho", "Summer", "Wildflower"],
  vars: {
    "--theme-bg": "#F3EFE0",
    "--theme-text": "#423B2A",
    "--theme-accent": "#C9974F",
    "--theme-font-heading": "var(--font-fraunces), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-bg-texture": "url('/patterns/leaves.svg')",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
