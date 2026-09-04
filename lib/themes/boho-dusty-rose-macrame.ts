import type { Theme } from "./types";

// A soft dusty-rose boho theme -- the macrame/dried-flower end of boho
// rather than the desert/terracotta end, for a spring garden-boho wedding.
export const bohoDustyRoseMacrame: Theme = {
  id: "boho-dusty-rose-macrame",
  name: "Dusty Rose Macrame",
  category: "boho",
  season: "spring",
  tags: ["Boho", "Romantic", "Spring", "Macrame", "Lace"],
  vars: {
    "--theme-bg": "#F3E7E3",
    "--theme-text": "#4A342E",
    "--theme-accent": "#C08E82",
    "--theme-font-heading": "var(--font-fraunces), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
