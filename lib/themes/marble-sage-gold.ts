import type { Theme } from "./types";

// A pale sage-grey marble theme -- palette chosen to pair directly with
// marble-color-geode.svg's own sage-green/gold agate colors (see
// decorMotifs.ts) rather than picked first and contrast-checked after.
export const marbleSageGold: Theme = {
  id: "marble-sage-gold",
  name: "Sage & Gold Marble",
  category: "marble",
  season: "winter",
  tags: ["Marble", "Elegant", "Winter"],
  vars: {
    "--theme-bg": "#EDEEE7",
    "--theme-text": "#2E3A32",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.44:1 against this theme's own #EDEEE7 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.06:1.
    "--theme-accent": "#A78148",
    "--theme-font-heading": "var(--font-marcellus), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant), Georgia, serif",
    "--theme-font-script": "var(--font-sacramento), cursive",
  },
};
