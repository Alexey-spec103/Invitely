import type { Theme } from "./types";

// The Пионы batch's own assets have a pale cream base fill (#E4E5DF) --
// a background this close to that same paleness is what made peony decor
// vanish on botanical-fern earlier today. Deliberately deeper/richer here
// (not stark pale) so the flowers keep real definition against it.
export const peonyBlushBurgundy: Theme = {
  id: "peony-blush-burgundy",
  name: "Blush & Burgundy Peony",
  category: "peony",
  season: "spring",
  tags: ["Peony", "Romantic", "Spring"],
  vars: {
    "--theme-bg": "#E8CFC7",
    "--theme-text": "#3D2420",
    "--theme-accent": "#84443F",
    "--theme-font-heading": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant), Georgia, serif",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
