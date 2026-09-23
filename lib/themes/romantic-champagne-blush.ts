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
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 1.73:1 against this theme's own #FAF1EA bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.03:1.
    "--theme-accent": "#BD7E40",
    "--theme-font-heading": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
