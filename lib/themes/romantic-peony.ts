import type { Theme } from "./types";

// A brighter, more saturated pink than Romantic Blush's muted rose-gold --
// a true peony pink for a couple who wants romantic to also read as vivid.
export const romanticPeony: Theme = {
  id: "romantic-peony",
  name: "Peony",
  category: "romantic",
  season: "spring",
  tags: ["Romantic", "Botanical", "Spring", "Peonies"],
  vars: {
    "--theme-bg": "#FBEFF0",
    "--theme-text": "#4A2E33",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.28:1 against this theme's own #FBEFF0 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.02:1.
    "--theme-accent": "#CF6D87",
    "--theme-font-heading": "var(--font-cormorant), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-sacramento), var(--font-caveat), cursive",
  },
};
