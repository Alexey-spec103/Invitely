import type { Theme } from "./types";

// A light rose-gold luxury theme -- two humanist serifs (Playfair +
// Cormorant) for a soft, romantic take on luxury rather than the catalog's
// mostly dark/formal luxury themes.
export const luxuryRoseGold: Theme = {
  id: "luxury-rose-gold",
  name: "Rose Gold",
  category: "luxury",
  season: "spring",
  tags: ["Luxury", "Romantic", "Spring", "Gold Foil"],
  vars: {
    "--theme-bg": "#FBF0EC",
    "--theme-text": "#3C2A26",
    "--theme-accent": "#C98F84",
    "--theme-font-heading": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-bg-texture": "url('/patterns/grain-light.svg')",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
