import type { Theme } from "./types";

// A winter-formal champagne-blush theme -- warmer and more neutral-tan
// than Blush & Gold's brighter metallic accent.
export const romanticChampagneBlush: Theme = {
  id: "romantic-champagne-blush",
  name: "Champagne Blush",
  category: "romantic",
  season: "winter",
  tags: ["Romantic", "Classic", "Winter", "Champagne"],
  vars: {
    "--theme-bg": "#FAF1EA",
    "--theme-text": "#423227",
    "--theme-accent": "#D9B48F",
    "--theme-font-heading": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-bg-texture": "url('/patterns/grain-light.svg')",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
