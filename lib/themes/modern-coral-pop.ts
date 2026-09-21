import type { Theme } from "./types";

// A hot coral accent -- the catalog's first true coral/orange-red, for a
// couple who wants modern to also feel energetic rather than restrained.
export const modernCoralPop: Theme = {
  id: "modern-coral-pop",
  name: "Coral Pop",
  category: "modern",
  season: "summer",
  tags: ["Modern", "Bold", "Summer", "Unusual"],
  vars: {
    "--theme-bg": "#FFF5F2",
    "--theme-text": "#241512",
    "--theme-accent": "#E8613F",
    "--theme-font-heading": "var(--font-italiana), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
