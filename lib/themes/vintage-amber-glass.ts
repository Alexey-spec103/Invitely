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
    "--theme-accent": "#B8823A",
    "--theme-font-heading": "var(--font-libre-baskerville), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-bg-texture": "url('/patterns/grain-light.svg')",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
