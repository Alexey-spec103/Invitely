import type { Theme } from "./types";

export const provenceCoralSage: Theme = {
  id: "provence-coral-sage",
  name: "Coral & Sage Provence",
  category: "provence",
  season: "summer",
  tags: ["Provence", "Romantic", "Summer"],
  vars: {
    "--theme-bg": "#DCE0C8",
    "--theme-text": "#2E3624",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.70:1 against this theme's own #DCE0C8 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.00:1.
    "--theme-accent": "#C56055",
    "--theme-font-heading": "var(--font-fraunces), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
