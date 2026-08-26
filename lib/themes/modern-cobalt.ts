import type { Theme } from "./types";

// A saturated primary blue as the accent -- every other theme in the
// catalog uses a muted/dusty accent color, so this is deliberately bold
// and graphic, suited to a design-forward modern couple.
export const modernCobalt: Theme = {
  id: "modern-cobalt",
  name: "Modern Cobalt",
  category: "modern",
  tags: ["Modern", "Bold", "Abstract", "Unusual"],
  vars: {
    "--theme-bg": "#FFFFFF",
    "--theme-text": "#14171A",
    "--theme-accent": "#2952E3",
    "--theme-font-heading": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-body": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-accent": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-bg-texture": "url('/patterns/dot-grid.svg')",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
