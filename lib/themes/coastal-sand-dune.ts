import type { Theme } from "./types";

// A warm sand-and-gold coastal theme -- Cormorant Garamond headings for a
// romantic register, distinct from the cooler blue-green coastal themes.
export const coastalSandDune: Theme = {
  id: "coastal-sand-dune",
  name: "Sand Dune",
  category: "coastal",
  season: "summer",
  tags: ["Coastal", "Romantic", "Summer", "Landscape"],
  vars: {
    "--theme-bg": "#F6EFE2",
    "--theme-text": "#3D362A",
    "--theme-accent": "#C9A86A",
    "--theme-font-heading": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-bg-texture": "url('/patterns/waves.svg')",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
