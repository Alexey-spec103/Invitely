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
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.61:1 against this theme's own #EFE3D6 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.04:1.
    "--theme-accent": "#BF6D3C",
    "--theme-font-heading": "var(--font-gilda-display), var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
