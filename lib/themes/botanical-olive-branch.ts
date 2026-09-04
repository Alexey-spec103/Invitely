import type { Theme } from "./types";

// A summer olive-branch botanical theme -- straddles botanical and rustic,
// filed as botanical since the leaf motif and Cormorant heading lead.
export const botanicalOliveBranch: Theme = {
  id: "botanical-olive-branch",
  name: "Olive Branch",
  category: "botanical",
  season: "summer",
  tags: ["Botanical", "Rustic", "Summer", "Greenery"],
  vars: {
    "--theme-bg": "#EEEEE1",
    "--theme-text": "#363A2A",
    "--theme-accent": "#869467",
    "--theme-font-heading": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
