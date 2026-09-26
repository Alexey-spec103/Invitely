import type { Theme } from "./types";

export const gildedIvory: Theme = {
  id: "gilded-ivory",
  name: "Gilded Ivory",
  category: "luxury",
  season: "spring",
  tags: ["Luxury", "Classic", "Spring", "Gold Foil"],
  vars: {
    "--theme-bg": "#FBF8F1",
    "--theme-text": "#2B2620",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.71:1 against this theme's own #FBF8F1 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.05:1.
    "--theme-accent": "#B1884C",
    "--theme-font-heading": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-accent": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-script": "var(--font-sacramento), cursive",
  },
};
