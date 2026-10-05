import type { Theme } from "./types";

export const botanicalSage: Theme = {
  id: "botanical-sage",
  name: "Botanical Sage",
  category: "botanical",
  season: "spring",
  tags: ["Botanical", "Romantic", "Spring", "Greenery"],
  vars: {
    "--theme-bg": "#EDF0E9",
    "--theme-text": "#3D4A3A",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.54:1 against this theme's own #EDF0E9 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.05:1.
    "--theme-accent": "#7C8F67",
    "--theme-font-heading": "var(--font-cormorant), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-accent": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-script": "var(--font-sacramento), var(--font-caveat), cursive",
  },
};
