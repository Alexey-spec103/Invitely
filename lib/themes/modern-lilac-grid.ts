import type { Theme } from "./types";

// A modern lilac theme -- the dot-grid texture and Space Grotesk headings
// keep this reading as structured/modern rather than soft/romantic despite
// the purple accent.
export const modernLilacGrid: Theme = {
  id: "modern-lilac-grid",
  name: "Lilac Grid",
  category: "modern",
  season: "spring",
  tags: ["Modern", "Romantic", "Spring", "Abstract"],
  vars: {
    "--theme-bg": "#F6F2F7",
    "--theme-text": "#2E2536",
    "--theme-accent": "#9B7FC4",
    "--theme-font-heading": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-bg-texture": "url('/patterns/dot-grid.svg')",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
