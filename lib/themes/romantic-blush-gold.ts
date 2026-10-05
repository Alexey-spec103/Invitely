import type { Theme } from "./types";

// A warmer, more golden take on classic blush-and-gold than Romantic
// Blush's cooler beige base -- Playfair Display headings for more formality.
export const romanticBlushGold: Theme = {
  id: "romantic-blush-gold",
  name: "Blush & Gold",
  category: "romantic",
  season: "spring",
  tags: ["Romantic", "Classic", "Spring", "Gold Foil"],
  vars: {
    "--theme-bg": "#FBF1E8",
    "--theme-text": "#453424",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.08:1 against this theme's own #FBF1E8 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.09:1.
    "--theme-accent": "#B3812B",
    "--theme-font-heading": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), var(--font-caveat), cursive",
  },
};
