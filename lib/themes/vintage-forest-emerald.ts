import type { Theme } from "./types";

// A formal forest-emerald vintage theme -- Cinzel headings for a more
// classical/formal register than the catalog's other green vintage-adjacent
// themes.
export const vintageForestEmerald: Theme = {
  id: "vintage-forest-emerald",
  name: "Forest Emerald",
  category: "vintage",
  season: "winter",
  tags: ["Vintage", "Classic", "Winter", "Antique"],
  vars: {
    "--theme-bg": "#E6EAE1",
    "--theme-text": "#2C362A",
    "--theme-accent": "#4F7259",
    "--theme-font-heading": "var(--font-cinzel), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
