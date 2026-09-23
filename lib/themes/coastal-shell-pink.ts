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
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 1.90:1 against this theme's own #FBF1EE bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.07:1.
    "--theme-accent": "#C47762",
    "--theme-font-heading": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
