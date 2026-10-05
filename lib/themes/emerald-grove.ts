import type { Theme } from "./types";

export const emeraldGrove: Theme = {
  id: "emerald-grove",
  name: "Emerald Grove",
  category: "botanical",
  season: "autumn",
  tags: ["Botanical", "Dark", "Autumn", "Landscape"],
  vars: {
    "--theme-bg": "#16241C",
    "--theme-text": "#EAE7DD",
    "--theme-accent": "#8FBFA0",
    "--theme-font-heading": "var(--font-marcellus), var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-accent": "var(--font-fraunces), var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), var(--font-caveat), cursive",
  },
};
