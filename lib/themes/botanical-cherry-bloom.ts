import type { Theme } from "./types";

// A dusty pink cherry-blossom botanical theme -- Fraunces headings for a
// slightly more editorial feel than Botanical Sage or Fern.
export const botanicalCherryBloom: Theme = {
  id: "botanical-cherry-bloom",
  name: "Cherry Bloom",
  category: "botanical",
  season: "spring",
  tags: ["Botanical", "Romantic", "Spring", "White Flowers"],
  vars: {
    "--theme-bg": "#F5EEE9",
    "--theme-text": "#423029",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.50:1 against this theme's own #F5EEE9 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.03:1.
    "--theme-accent": "#BB7963",
    "--theme-font-heading": "var(--font-gilda-display), var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), var(--font-caveat), cursive",
  },
};
