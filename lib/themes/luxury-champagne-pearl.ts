import type { Theme } from "./types";

// A light champagne-and-pearl luxury theme -- Playfair over Cormorant for
// two humanist serifs together, distinct from Ivory & Platinum's cooler,
// sans-paired take on a similarly light palette.
export const luxuryChampagnePearl: Theme = {
  id: "luxury-champagne-pearl",
  name: "Champagne Pearl",
  category: "luxury",
  season: "spring",
  tags: ["Luxury", "Classic", "Spring", "Pearl"],
  vars: {
    "--theme-bg": "#FAF5EC",
    "--theme-text": "#33291F",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 1.74:1 against this theme's own #FAF5EC bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.09:1.
    "--theme-accent": "#AE8632",
    "--theme-font-heading": "var(--font-italiana), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
