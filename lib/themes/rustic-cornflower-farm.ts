import type { Theme } from "./types";

// A cornflower-blue rustic theme -- the catalog's first blue-accented
// rustic palette, distinct from the brown/olive/wheat tones elsewhere.
export const rusticCornflowerFarm: Theme = {
  id: "rustic-cornflower-farm",
  name: "Cornflower Farm",
  category: "rustic",
  season: "summer",
  tags: ["Rustic", "Summer", "Landscape"],
  vars: {
    "--theme-bg": "#EFEEDD",
    "--theme-text": "#383C2C",
    "--theme-accent": "#6E7FA0",
    "--theme-font-heading": "var(--font-libre-baskerville), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-bg-texture": "url('/patterns/grain-light.svg')",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
