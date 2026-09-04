import type { Theme } from "./types";

// A near-black base with a dusty rose-gold accent -- softer and more
// romantic than the existing dark themes, which lean bronze/gold/true-black
// geometric rather than pink.
export const darkOnyxRose: Theme = {
  id: "dark-onyx-rose",
  name: "Onyx & Rose",
  category: "dark",
  season: "winter",
  tags: ["Dark", "Romantic", "Winter", "Dark Background"],
  vars: {
    "--theme-bg": "#17141A",
    "--theme-text": "#EDE6E0",
    "--theme-accent": "#C97B92",
    "--theme-font-heading": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-body": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-accent": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
