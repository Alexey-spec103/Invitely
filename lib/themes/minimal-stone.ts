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
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.42:1 against this theme's own #F4F2EE bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.02:1.
    "--theme-accent": "#968A7B",
    "--theme-font-heading": "var(--font-space-grotesk), var(--font-inter), system-ui, sans-serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), var(--font-caveat), cursive",
  },
};
