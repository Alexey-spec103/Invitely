import type { Theme } from "./types";

// A near-black wine-red dark theme -- cooler and darker background than
// Burgundy Velvet's lighter wine-red base, with Cinzel headings.
export const darkWineNoir: Theme = {
  id: "dark-wine-noir",
  name: "Wine Noir",
  category: "dark",
  season: "winter",
  tags: ["Dark", "Luxury", "Winter", "Dark Background"],
  vars: {
    "--theme-bg": "#1C0F13",
    "--theme-text": "#EEE2E4",
    "--theme-accent": "#8E4258",
    "--theme-font-heading": "var(--font-bodoni-moda), Georgia, serif",
    "--theme-font-body": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
