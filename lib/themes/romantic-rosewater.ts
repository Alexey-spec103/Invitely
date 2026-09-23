import type { Theme } from "./types";

// A very soft, pale rosewater pink -- lighter and more neutral than the
// catalog's other pink romantic themes, closer to a blush-white register.
export const romanticRosewater: Theme = {
  id: "romantic-rosewater",
  name: "Rosewater",
  category: "romantic",
  season: "spring",
  tags: ["Romantic", "Spring", "Pastel"],
  vars: {
    "--theme-bg": "#FBF0EC",
    "--theme-text": "#452F2A",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.04:1 against this theme's own #FBF0EC bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.07:1.
    "--theme-accent": "#C77559",
    "--theme-font-heading": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
