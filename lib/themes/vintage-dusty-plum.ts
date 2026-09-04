import type { Theme } from "./types";

// A dusty plum/mauve vintage theme -- a purple-family vintage register, the
// catalog's vintage themes so far are brown/pink/mint/red, not purple.
export const vintageDustyPlum: Theme = {
  id: "vintage-dusty-plum",
  name: "Dusty Plum",
  category: "vintage",
  season: "winter",
  tags: ["Vintage", "Romantic", "Winter", "Antique"],
  vars: {
    "--theme-bg": "#EFE6E9",
    "--theme-text": "#40333A",
    "--theme-accent": "#8E6478",
    "--theme-font-heading": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
