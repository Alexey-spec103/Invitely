import type { Theme } from "./types";

// A cooler blue-green botanical theme -- Fraunces headings for a slightly
// more editorial feel than the classic serif botanical themes.
export const botanicalEucalyptus: Theme = {
  id: "botanical-eucalyptus",
  name: "Eucalyptus",
  category: "botanical",
  season: "spring",
  tags: ["Botanical", "Modern", "Spring", "Eucalyptus"],
  vars: {
    "--theme-bg": "#E9EEEA",
    "--theme-text": "#364039",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.56:1 against this theme's own #E9EEEA bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.09:1.
    "--theme-accent": "#6B8E7C",
    "--theme-font-heading": "var(--font-fraunces), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
