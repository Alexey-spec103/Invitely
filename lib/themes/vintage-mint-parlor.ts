import type { Theme } from "./types";

// A 1950s "parlor" vintage register -- muted mint instead of the more
// common vintage pinks/browns, Playfair Display headings.
export const vintageMintParlor: Theme = {
  id: "vintage-mint-parlor",
  name: "Mint Parlor",
  category: "vintage",
  season: "spring",
  tags: ["Vintage", "Botanical", "Spring", "Antique"],
  vars: {
    "--theme-bg": "#EDEFE4",
    "--theme-text": "#3B4136",
    "--theme-accent": "#7C9885",
    "--theme-font-heading": "var(--font-italiana), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
