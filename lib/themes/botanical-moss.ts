import type { Theme } from "./types";

// A cool, deep moss-green spring botanical theme -- Playfair Display
// headings for a slightly more formal register than Fern or Eucalyptus.
export const botanicalMoss: Theme = {
  id: "botanical-moss",
  name: "Moss",
  category: "botanical",
  season: "spring",
  tags: ["Botanical", "Spring", "Greenery"],
  vars: {
    "--theme-bg": "#E7EAE0",
    "--theme-text": "#313A2C",
    "--theme-accent": "#5E7255",
    "--theme-font-heading": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
