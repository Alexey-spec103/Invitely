import type { Theme } from "./types";

// Pairs with marble-color-teal.svg's own teal-green/gold druzy-crystal
// palette.
export const marbleTealGold: Theme = {
  id: "marble-teal-gold",
  name: "Teal & Gold Marble",
  category: "marble",
  season: "spring",
  tags: ["Marble", "Elegant", "Spring"],
  vars: {
    "--theme-bg": "#EAF0EC",
    "--theme-text": "#1F3B33",
    "--theme-accent": "#C9A24C",
    "--theme-font-heading": "var(--font-cinzel), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-sacramento), cursive",
  },
};
