import type { Theme } from "./types";

// A lavender-and-leaf botanical theme -- purple accent instead of the
// green/sage tones most botanical themes use, filed botanical for the
// Cormorant heading.
export const botanicalLavenderSprig: Theme = {
  id: "botanical-lavender-sprig",
  name: "Lavender Sprig",
  category: "botanical",
  season: "summer",
  tags: ["Botanical", "Boho", "Summer", "Provence"],
  vars: {
    "--theme-bg": "#F0EEF3",
    "--theme-text": "#38334A",
    "--theme-accent": "#8C7CB0",
    "--theme-font-heading": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
