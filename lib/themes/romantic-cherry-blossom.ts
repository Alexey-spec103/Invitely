import type { Theme } from "./types";

// A spring cherry-blossom pink -- softer and cooler-toned than Peony's
// saturated pink, with EB Garamond for a gentler classical register.
export const romanticCherryBlossom: Theme = {
  id: "romantic-cherry-blossom",
  name: "Cherry Blossom",
  category: "romantic",
  season: "spring",
  tags: ["Romantic", "Botanical", "Spring", "White Flowers"],
  vars: {
    "--theme-bg": "#FCF0F1",
    "--theme-text": "#4A2E33",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 1.81:1 against this theme's own #FCF0F1 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.03:1.
    "--theme-accent": "#CC7085",
    "--theme-font-heading": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), var(--font-caveat), cursive",
  },
};
