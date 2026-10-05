import type { Theme } from "./types";

// A yellow-green "garden party" romantic theme -- unusual accent hue for
// the romantic category, most of which lean pink/gold/red.
export const romanticGardenParty: Theme = {
  id: "romantic-garden-party",
  name: "Garden Party",
  category: "romantic",
  season: "summer",
  tags: ["Romantic", "Botanical", "Summer", "Garden"],
  vars: {
    "--theme-bg": "#F4EFE3",
    "--theme-text": "#3A3B27",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.01:1 against this theme's own #F4EFE3 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.09:1.
    "--theme-accent": "#858D50",
    "--theme-font-heading": "var(--font-fraunces), var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), var(--font-caveat), cursive",
  },
};
