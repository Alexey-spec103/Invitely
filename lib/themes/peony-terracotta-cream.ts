import type { Theme } from "./types";

export const peonyTerracottaCream: Theme = {
  id: "peony-terracotta-cream",
  name: "Terracotta & Cream Peony",
  category: "peony",
  season: "autumn",
  tags: ["Peony", "Romantic", "Autumn"],
  vars: {
    "--theme-bg": "#EDDDC0",
    "--theme-text": "#43362A",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.76:1 against this theme's own #EDDDC0 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.03:1.
    "--theme-accent": "#BF6640",
    "--theme-font-heading": "var(--font-fraunces), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
