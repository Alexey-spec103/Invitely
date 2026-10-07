import type { Theme } from "./types";

// A near-black wine-red dark theme -- cooler and darker background than
// Burgundy Velvet's lighter wine-red base, with Cinzel headings.
export const darkWineNoir: Theme = {
  id: "dark-wine-noir",
  name: "Wine Noir",
  category: "dark",
  season: "winter",
  tags: ["Dark", "Luxury", "Winter", "Dark Background"],
  vars: {
    "--theme-bg": "#1C0F13",
    "--theme-text": "#EEE2E4",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.72:1 against this theme's own #1C0F13 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.01:1.
    "--theme-accent": "#98475E",
    "--theme-font-heading": "var(--font-bodoni-moda), var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-space-grotesk), var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-sacramento), var(--font-caveat), cursive",
  },
};
