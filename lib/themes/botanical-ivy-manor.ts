import type { Theme } from "./types";

// A deep ivy-green botanical theme for an autumn estate wedding --
// Playfair Display headings for more formality than Fern or Moss.
export const botanicalIvyManor: Theme = {
  id: "botanical-ivy-manor",
  name: "Ivy Manor",
  category: "botanical",
  season: "autumn",
  tags: ["Botanical", "Classic", "Autumn", "Greenery"],
  vars: {
    "--theme-bg": "#E8ECE4",
    "--theme-text": "#2D3527",
    "--theme-accent": "#4F6B44",
    "--theme-font-heading": "var(--font-marcellus), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
