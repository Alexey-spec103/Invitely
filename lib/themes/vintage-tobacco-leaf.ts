import type { Theme } from "./types";

// A tobacco-brown vintage theme -- straddles vintage and rustic, filed as
// vintage for the EB Garamond body and formal Libre Baskerville heading.
export const vintageTobaccoLeaf: Theme = {
  id: "vintage-tobacco-leaf",
  name: "Tobacco Leaf",
  category: "vintage",
  season: "autumn",
  tags: ["Vintage", "Rustic", "Autumn", "Antique"],
  vars: {
    "--theme-bg": "#EDE2CF",
    "--theme-text": "#453626",
    "--theme-accent": "#8A6B3D",
    "--theme-font-heading": "var(--font-libre-baskerville), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-bg-texture": "url('/patterns/grain-light.svg')",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
