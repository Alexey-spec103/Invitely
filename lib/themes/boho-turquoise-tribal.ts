import type { Theme } from "./types";

// A turquoise-accented boho theme -- straddles boho and coastal, filed as
// boho for the Caveat script rather than a coastal register.
export const bohoTurquoiseTribal: Theme = {
  id: "boho-turquoise-tribal",
  name: "Turquoise Tribal",
  category: "boho",
  season: "summer",
  tags: ["Boho", "Coastal", "Summer", "Turquoise"],
  vars: {
    "--theme-bg": "#EEF3F0",
    "--theme-text": "#263631",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.78:1 against this theme's own #EEF3F0 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.02:1.
    "--theme-accent": "#4C9983",
    "--theme-font-heading": "var(--font-cormorant), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
