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
    "--theme-accent": "#9FA6AC",
    "--theme-font-heading": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
