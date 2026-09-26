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
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.70:1 against this theme's own #EDEFE4 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.06:1.
    "--theme-accent": "#718F7A",
    "--theme-font-heading": "var(--font-italiana), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-sacramento), cursive",
  },
};
