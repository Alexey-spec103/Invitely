import type { Theme } from "./types";

// A modern take on sage green -- Space Grotesk headings instead of the
// softer serif every other sage/green theme uses -- reads as structured
// rather than organic.
export const modernSageGrid: Theme = {
  id: "modern-sage-grid",
  name: "Sage Grid",
  category: "modern",
  season: "spring",
  tags: ["Modern", "Botanical", "Spring", "Abstract"],
  vars: {
    "--theme-bg": "#F1F4EE",
    "--theme-text": "#263024",
    "--theme-accent": "#6F8F5C",
    "--theme-font-heading": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
