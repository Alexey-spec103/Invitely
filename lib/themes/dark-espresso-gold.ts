import type { Theme } from "./types";

// A warm espresso-brown dark theme with gold -- distinct from the cooler
// true-black dark themes elsewhere, for an autumn evening register.
export const darkEspressoGold: Theme = {
  id: "dark-espresso-gold",
  name: "Espresso & Gold",
  category: "dark",
  season: "autumn",
  tags: ["Dark", "Luxury", "Autumn", "Dark Background"],
  vars: {
    "--theme-bg": "#1A120C",
    "--theme-text": "#EFE6DA",
    "--theme-accent": "#C9A15A",
    "--theme-font-heading": "var(--font-bodoni-moda), var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-space-grotesk), var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), var(--font-caveat), cursive",
  },
};
