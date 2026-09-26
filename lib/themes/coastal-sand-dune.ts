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
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 1.98:1 against this theme's own #F6EFE2 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.03:1.
    "--theme-accent": "#A9843D",
    "--theme-font-heading": "var(--font-marcellus), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-sacramento), cursive",
  },
};
