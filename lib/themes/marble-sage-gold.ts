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
    "--theme-accent": "#B8935A",
    "--theme-font-heading": "var(--font-marcellus), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant), Georgia, serif",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
