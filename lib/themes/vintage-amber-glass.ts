import type { Theme } from "./types";

// An amber-glass vintage theme -- evokes old apothecary bottles, warmer
// and more golden-brown than Sepia Lace or Tobacco Leaf.
export const vintageAmberGlass: Theme = {
  id: "vintage-amber-glass",
  name: "Amber Glass",
  category: "vintage",
  season: "autumn",
  tags: ["Vintage", "Autumn", "Antique"],
  vars: {
    "--theme-bg": "#F0E4CC",
    "--theme-text": "#453522",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.65:1 against this theme's own #F0E4CC bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.11:1.
    "--theme-accent": "#A87735",
    "--theme-font-heading": "var(--font-libre-baskerville), var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
