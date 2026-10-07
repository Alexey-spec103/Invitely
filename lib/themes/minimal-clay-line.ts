import type { Theme } from "./types";

// A minimal theme with a warm clay accent -- pairs a structured dot-grid
// and Space Grotesk with an otherwise warm/autumn palette.
export const minimalClayLine: Theme = {
  id: "minimal-clay-line",
  name: "Clay Line",
  category: "minimal",
  season: "autumn",
  tags: ["Minimal", "Warm", "Autumn", "Minimalism"],
  vars: {
    "--theme-bg": "#F6F1EC",
    "--theme-text": "#302620",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.71:1 against this theme's own #F6F1EC bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.08:1.
    "--theme-accent": "#B27F5C",
    "--theme-font-heading": "var(--font-space-grotesk), var(--font-inter), system-ui, sans-serif",
    "--theme-font-body": "var(--font-space-grotesk), var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-sacramento), var(--font-caveat), cursive",
  },
};
