import type { Theme } from "./types";

// Deeper lavender-grey, not stark pale, for the same reason peony's
// palettes were built deep -- the Прованс batch's own assets share the
// same pale #E4E5DF base fill that vanishes against near-white bg.
export const provenceLavenderSage: Theme = {
  id: "provence-lavender-sage",
  name: "Lavender & Sage Provence",
  category: "provence",
  season: "spring",
  tags: ["Provence", "Romantic", "Spring"],
  vars: {
    "--theme-bg": "#D9D3E0",
    "--theme-text": "#332B42",
    "--theme-accent": "#7A6A9E",
    "--theme-font-heading": "var(--font-gilda-display), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant), Georgia, serif",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
