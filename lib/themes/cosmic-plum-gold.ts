import type { Theme } from "./types";

export const cosmicPlumGold: Theme = {
  id: "cosmic-plum-gold",
  name: "Plum & Gold",
  category: "cosmic",
  season: "autumn",
  tags: ["Cosmic", "Dark", "Dark Background", "Autumn"],
  vars: {
    "--theme-bg": "#1D0F1C",
    "--theme-text": "#EEE3E6",
    "--theme-accent": "#CDA24E",
    "--theme-font-heading": "var(--font-marcellus), var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), var(--font-caveat), cursive",
  },
};
