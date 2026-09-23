import type { Theme } from "./types";

// A golden honey-and-beeswax rustic theme -- brighter and yellower than
// Wheatfield's more muted wheat tone.
export const rusticHoneyHive: Theme = {
  id: "rustic-honey-hive",
  name: "Honey Hive",
  category: "rustic",
  season: "summer",
  tags: ["Rustic", "Warm", "Summer", "Harvest"],
  vars: {
    "--theme-bg": "#F2E6C8",
    "--theme-text": "#4A3A18",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.37:1 against this theme's own #F2E6C8 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.03:1.
    "--theme-accent": "#AF7928",
    "--theme-font-heading": "var(--font-fraunces), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
