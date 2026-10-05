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
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.08:1 against this theme's own #EAF0EC bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.10:1.
    "--theme-accent": "#A68232",
    "--theme-font-heading": "var(--font-cinzel), var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-sacramento), var(--font-caveat), cursive",
  },
};
