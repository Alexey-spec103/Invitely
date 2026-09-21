import type { Theme } from "./types";

// Same terracotta family as Boho Terracotta but paired with Space Grotesk
// instead of Fraunces -- a structured, gallery-poster take on the color
// rather than a warm/organic one.
export const modernTerracottaGrid: Theme = {
  id: "modern-terracotta-grid",
  name: "Terracotta Grid",
  category: "modern",
  season: "summer",
  tags: ["Modern", "Warm", "Summer", "Abstract"],
  vars: {
    "--theme-bg": "#FBEEE6",
    "--theme-text": "#3A2A20",
    "--theme-accent": "#C1633B",
    "--theme-font-heading": "var(--font-italiana), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-accent": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
