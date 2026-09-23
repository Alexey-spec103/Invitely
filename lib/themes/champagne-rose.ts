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
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.18:1 against this theme's own #F7EFE9 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.08:1.
    "--theme-accent": "#B77B5E",
    "--theme-font-heading": "var(--font-marcellus), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-accent": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
