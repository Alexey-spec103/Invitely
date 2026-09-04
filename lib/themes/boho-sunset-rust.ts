import type { Theme } from "./types";

// A hot sunset-rust boho theme -- more orange/red-leaning than Desert
// Clay's browner clay tone, for a festival-at-dusk register.
export const bohoSunsetRust: Theme = {
  id: "boho-sunset-rust",
  name: "Sunset Rust",
  category: "boho",
  season: "autumn",
  tags: ["Boho", "Warm", "Autumn", "Sunset"],
  vars: {
    "--theme-bg": "#F2E2D2",
    "--theme-text": "#4A2E20",
    "--theme-accent": "#D0713F",
    "--theme-font-heading": "var(--font-fraunces), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
