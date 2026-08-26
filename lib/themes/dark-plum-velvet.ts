import type { Theme } from "./types";

// A deep aubergine/plum base with an orchid accent -- the catalog's first
// purple-family dark theme, distinct from the existing burgundy/navy/black
// dark palettes.
export const darkPlumVelvet: Theme = {
  id: "dark-plum-velvet",
  name: "Plum Velvet",
  category: "dark",
  season: "winter",
  tags: ["Dark", "Luxury", "Winter", "Dark Background"],
  vars: {
    "--theme-bg": "#201220",
    "--theme-text": "#EFE4EA",
    "--theme-accent": "#B27FB0",
    "--theme-font-heading": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-bg-texture": "url('/patterns/grain-dark.svg')",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
