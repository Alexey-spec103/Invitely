import type { Theme } from "./types";

// A hotter, more saturated desert-clay boho palette than Boho Terracotta's
// softer parchment base -- paired with Caveat for a looser, festival feel.
export const bohoDesertClay: Theme = {
  id: "boho-desert-clay",
  name: "Desert Clay",
  category: "boho",
  season: "autumn",
  tags: ["Boho", "Warm", "Autumn", "Dried Flowers"],
  vars: {
    "--theme-bg": "#EFE3D6",
    "--theme-text": "#4A3324",
    "--theme-accent": "#C77B4E",
    "--theme-font-heading": "var(--font-gilda-display), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
