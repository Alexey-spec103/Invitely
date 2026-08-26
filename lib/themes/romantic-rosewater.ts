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
    "--theme-accent": "#D89E8B",
    "--theme-font-heading": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-bg-texture": "url('/patterns/leaves.svg')",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
