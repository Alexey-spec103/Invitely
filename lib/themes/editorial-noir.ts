import type { Theme } from "./types";

export const editorialNoir: Theme = {
  id: "editorial-noir",
  name: "Editorial Noir",
  category: "dark",
  season: "winter",
  tags: ["Dark", "Modern", "Winter", "Dark Background", "Typography"],
  vars: {
    "--theme-bg": "#161412",
    "--theme-text": "#F5F0E8",
    "--theme-accent": "#B08D57",
    "--theme-font-heading": "var(--font-italiana), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-accent": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
