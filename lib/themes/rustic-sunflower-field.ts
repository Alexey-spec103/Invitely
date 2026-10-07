import type { Theme } from "./types";

// A bright sunflower-yellow rustic theme -- bolder and more saturated than
// Honey Hive's softer amber tone.
export const rusticSunflowerField: Theme = {
  id: "rustic-sunflower-field",
  name: "Sunflower Field",
  category: "rustic",
  season: "summer",
  tags: ["Rustic", "Botanical", "Summer", "Wildflower"],
  vars: {
    "--theme-bg": "#F3EAC9",
    "--theme-text": "#453A1C",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 1.82:1 against this theme's own #F3EAC9 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.07:1.
    "--theme-accent": "#A67F1E",
    "--theme-font-heading": "var(--font-gilda-display), var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-sacramento), var(--font-caveat), cursive",
  },
};
