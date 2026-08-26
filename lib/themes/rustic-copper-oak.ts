import type { Theme } from "./types";

// A deeper copper-on-oak rustic register than Barnwood -- more saturated
// accent, for a warmer autumn barn wedding.
export const rusticCopperOak: Theme = {
  id: "rustic-copper-oak",
  name: "Copper Oak",
  category: "rustic",
  season: "autumn",
  tags: ["Rustic", "Warm", "Autumn", "Landscape"],
  vars: {
    "--theme-bg": "#EEE1CE",
    "--theme-text": "#4A3620",
    "--theme-accent": "#A85C32",
    "--theme-font-heading": "var(--font-libre-baskerville), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-bg-texture": "url('/patterns/grain-light.svg')",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
