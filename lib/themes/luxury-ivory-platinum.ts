import type { Theme } from "./types";

// A light-toned luxury theme -- every existing luxury theme is either dark
// or warm-gold; this pairs ivory with a cool platinum/grey accent for a
// bright, editorial formal look.
export const luxuryIvoryPlatinum: Theme = {
  id: "luxury-ivory-platinum",
  name: "Ivory & Platinum",
  category: "luxury",
  season: "winter",
  tags: ["Luxury", "Modern", "Winter", "Marble"],
  vars: {
    "--theme-bg": "#FAF8F4",
    "--theme-text": "#2A2A2A",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.32:1 against this theme's own #FAF8F4 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.10:1.
    "--theme-accent": "#868F97",
    "--theme-font-heading": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
