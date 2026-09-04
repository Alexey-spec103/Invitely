import type { Theme } from "./types";

// A pale lilac vintage theme -- softer and pinker-purple than Dusty Plum,
// for a spring parlor-tea-party register.
export const vintageLilacParlor: Theme = {
  id: "vintage-lilac-parlor",
  name: "Lilac Parlor",
  category: "vintage",
  season: "spring",
  tags: ["Vintage", "Romantic", "Spring", "Antique"],
  vars: {
    "--theme-bg": "#F1ECEF",
    "--theme-text": "#3B3441",
    "--theme-accent": "#A08BB5",
    "--theme-font-heading": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
