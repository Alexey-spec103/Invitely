import type { Theme } from "./types";

// A minimal theme with a sage accent -- Space Grotesk keeps this reading
// as structured/minimal rather than botanical despite the green.
export const minimalSageLine: Theme = {
  id: "minimal-sage-line",
  name: "Sage Line",
  category: "minimal",
  season: "spring",
  tags: ["Minimal", "Botanical", "Spring", "Minimalism"],
  vars: {
    "--theme-bg": "#F5F6F1",
    "--theme-text": "#2A2E24",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.43:1 against this theme's own #F5F6F1 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.05:1.
    "--theme-accent": "#7E946B",
    "--theme-font-heading": "var(--font-space-grotesk), var(--font-inter), system-ui, sans-serif",
    "--theme-font-body": "var(--font-space-grotesk), var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
