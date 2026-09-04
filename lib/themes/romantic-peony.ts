import type { Theme } from "./types";

// A brighter, more saturated pink than Romantic Blush's muted rose-gold --
// a true peony pink for a couple who wants romantic to also read as vivid.
export const romanticPeony: Theme = {
  id: "romantic-peony",
  name: "Peony",
  category: "romantic",
  season: "spring",
  tags: ["Romantic", "Botanical", "Spring", "Peonies"],
  vars: {
    "--theme-bg": "#FBEFF0",
    "--theme-text": "#4A2E33",
    "--theme-accent": "#D98CA0",
    "--theme-font-heading": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
