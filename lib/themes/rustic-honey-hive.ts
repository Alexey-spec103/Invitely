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
    "--theme-accent": "#C88A2E",
    "--theme-font-heading": "var(--font-fraunces), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-bg-texture": "url('/patterns/grain-light.svg')",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
