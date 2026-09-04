import type { Theme } from "./types";

// A currently very-trendy pairing (soft sage green grounding a warm clay/
// terracotta accent) — distinct from Boho Terracotta, which is warm/orange
// dominant with terracotta as the base color rather than sage.
export const sageAndClay: Theme = {
  id: "sage-and-clay",
  name: "Sage & Clay",
  category: "boho",
  season: "spring",
  tags: ["Botanical", "Boho", "Warm", "Spring", "Dried Flowers"],
  vars: {
    "--theme-bg": "#E7EBDF",
    "--theme-text": "#3A3F30",
    "--theme-accent": "#B96B48",
    "--theme-font-heading": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-accent": "var(--font-fraunces), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
