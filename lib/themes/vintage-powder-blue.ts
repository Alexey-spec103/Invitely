import type { Theme } from "./types";

// A powder-blue vintage theme -- the catalog's first blue-family vintage
// register, evoking 1960s stationery rather than the usual warm vintage tones.
export const vintagePowderBlue: Theme = {
  id: "vintage-powder-blue",
  name: "Powder Blue",
  category: "vintage",
  season: "winter",
  tags: ["Vintage", "Classic", "Winter", "Antique"],
  vars: {
    "--theme-bg": "#E9EEF0",
    "--theme-text": "#2E3A40",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.31:1 against this theme's own #E9EEF0 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.02:1.
    "--theme-accent": "#638F9E",
    "--theme-font-heading": "var(--font-gilda-display), var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), var(--font-caveat), cursive",
  },
};
