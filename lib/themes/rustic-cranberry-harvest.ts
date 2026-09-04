import type { Theme } from "./types";

// A deep cranberry-red autumn harvest theme -- more saturated red than any
// other rustic palette, for a late-autumn wedding.
export const rusticCranberryHarvest: Theme = {
  id: "rustic-cranberry-harvest",
  name: "Cranberry Harvest",
  category: "rustic",
  season: "autumn",
  tags: ["Rustic", "Autumn", "Harvest"],
  vars: {
    "--theme-bg": "#EFE1D8",
    "--theme-text": "#4A2C22",
    "--theme-accent": "#9E4A3A",
    "--theme-font-heading": "var(--font-libre-baskerville), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
