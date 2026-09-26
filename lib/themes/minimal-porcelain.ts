import type { Theme } from "./types";

// The lightest-touch minimal theme in the catalog -- near-white on
// near-white with the faintest beige accent, single font family, no season.
export const minimalPorcelain: Theme = {
  id: "minimal-porcelain",
  name: "Porcelain",
  category: "minimal",
  tags: ["Minimal", "Marble", "Minimalism"],
  vars: {
    "--theme-bg": "#FAFAF8",
    "--theme-text": "#232323",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 1.71:1 against this theme's own #FAFAF8 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.04:1.
    "--theme-accent": "#9A8F7F",
    "--theme-font-heading": "var(--font-italiana), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-sacramento), cursive",
  },
};
