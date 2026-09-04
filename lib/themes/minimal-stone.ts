import type { Theme } from "./types";

// A warm-stone minimal theme -- Space Grotesk headings, distinct from
// Modern Mono's true monochrome and Nordic Minimal's cooler grey base.
export const minimalStone: Theme = {
  id: "minimal-stone",
  name: "Stone",
  category: "minimal",
  tags: ["Minimal", "Modern", "Marble"],
  vars: {
    "--theme-bg": "#F4F2EE",
    "--theme-text": "#2B2926",
    "--theme-accent": "#A69C8F",
    "--theme-font-heading": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
