import type { Theme } from "./types";

// A bright sunflower-yellow rustic theme paired with the leaf texture --
// bolder and more saturated than Honey Hive's softer amber tone.
export const rusticSunflowerField: Theme = {
  id: "rustic-sunflower-field",
  name: "Sunflower Field",
  category: "rustic",
  season: "summer",
  tags: ["Rustic", "Botanical", "Summer", "Wildflower"],
  vars: {
    "--theme-bg": "#F3EAC9",
    "--theme-text": "#453A1C",
    "--theme-accent": "#D9A82E",
    "--theme-font-heading": "var(--font-fraunces), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-bg-texture": "url('/patterns/leaves.svg')",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
