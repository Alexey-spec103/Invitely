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
    "--theme-accent": "#C7C1B8",
    "--theme-font-heading": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
