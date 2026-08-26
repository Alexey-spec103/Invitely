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
    "--theme-accent": "#D4A24C",
    "--theme-font-heading": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-bg-texture": "url('/patterns/grain-light.svg')",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
