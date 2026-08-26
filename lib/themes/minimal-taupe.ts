import type { Theme } from "./types";

// A pure single-font minimal theme -- Inter for both heading and body (the
// catalog's first "one typeface, no contrast" pairing outside Ink), warm
// taupe accent instead of Ink's true black.
export const minimalTaupe: Theme = {
  id: "minimal-taupe",
  name: "Taupe",
  category: "minimal",
  tags: ["Minimal", "Modern", "Minimalism"],
  vars: {
    "--theme-bg": "#F5F3F0",
    "--theme-text": "#2E2B27",
    "--theme-accent": "#8A7F72",
    "--theme-font-heading": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-bg-texture": "url('/patterns/dot-grid.svg')",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
