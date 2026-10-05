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
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.42:1 against this theme's own #FBF0EC bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.08:1.
    "--theme-accent": "#BE786B",
    "--theme-font-heading": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-sacramento), var(--font-caveat), cursive",
  },
};
