import type { Theme } from "./types";

// A shell-pink coastal theme -- the catalog's first pink-accented coastal
// palette, softer/more romantic than the blue/green/tan coastal themes.
export const coastalShellPink: Theme = {
  id: "coastal-shell-pink",
  name: "Shell Pink",
  category: "coastal",
  season: "summer",
  tags: ["Coastal", "Romantic", "Summer", "Marine"],
  vars: {
    "--theme-bg": "#FBF1EE",
    "--theme-text": "#4A342F",
    "--theme-accent": "#D9A79A",
    "--theme-font-heading": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-bg-texture": "url('/patterns/waves.svg')",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
