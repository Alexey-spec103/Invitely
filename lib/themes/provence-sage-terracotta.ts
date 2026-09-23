import type { Theme } from "./types";

export const provenceSageTerracotta: Theme = {
  id: "provence-sage-terracotta",
  name: "Sage & Terracotta Provence",
  category: "provence",
  season: "autumn",
  tags: ["Provence", "Romantic", "Autumn"],
  vars: {
    "--theme-bg": "#CBD4BC",
    "--theme-text": "#2B3324",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.62:1 against this theme's own #CBD4BC bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.02:1.
    "--theme-accent": "#AA6240",
    "--theme-font-heading": "var(--font-gilda-display), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
