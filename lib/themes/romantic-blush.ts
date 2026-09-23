import type { Theme } from "./types";

export const romanticBlush: Theme = {
  id: "romantic-blush",
  name: "Romantic Blush",
  category: "romantic",
  season: "spring",
  tags: ["Romantic", "Classic", "Spring", "White Flowers"],
  vars: {
    "--theme-bg": "#FBF3EF",
    "--theme-text": "#3A2E2C",
    // impeccable audit: the original #C9A96E measured 2.0:1 against this
    // theme's own #FBF3EF bg (needs 3:1 even for large decorative text) --
    // both were chosen pale on purpose for a soft look, which is exactly
    // what broke legibility. Deepened within the same antique-gold hue,
    // now passes 3.3:1.
    "--theme-accent": "#A08152",
    "--theme-font-heading": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-accent": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
