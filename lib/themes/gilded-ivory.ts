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
    "--theme-accent": "#B8925A",
    "--theme-font-heading": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-accent": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
