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
    "--theme-accent": "#B98A6A",
    "--theme-font-heading": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-body": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
