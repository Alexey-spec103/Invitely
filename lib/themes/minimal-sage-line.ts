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
    "--theme-accent": "#93A583",
    "--theme-font-heading": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-body": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-bg-texture": "url('/patterns/dot-grid.svg')",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
