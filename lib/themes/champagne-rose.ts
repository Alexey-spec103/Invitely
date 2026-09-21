import type { Theme } from "./types";

// Warm champagne/rose-gold — softer and more metallic-warm than Romantic
// Blush (which leans classic gold-on-blush) and less mauve/muted than
// Vintage Rosewood, landing closer to a modern "editorial blush" look.
export const champagneRose: Theme = {
  id: "champagne-rose",
  name: "Champagne Rose",
  category: "romantic",
  season: "spring",
  tags: ["Romantic", "Classic", "Spring", "Champagne"],
  vars: {
    "--theme-bg": "#F7EFE9",
    "--theme-text": "#4A3B36",
    "--theme-accent": "#C89B85",
    "--theme-font-heading": "var(--font-marcellus), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-accent": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
