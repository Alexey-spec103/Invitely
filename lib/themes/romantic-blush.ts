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
    "--theme-accent": "#C9A96E",
    "--theme-font-heading": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-accent": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
