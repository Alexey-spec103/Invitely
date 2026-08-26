import type { Theme } from "./types";

// A bright marigold-orange boho theme -- festival energy, more saturated
// than the other warm boho tones.
export const bohoMarigoldFestival: Theme = {
  id: "boho-marigold-festival",
  name: "Marigold Festival",
  category: "boho",
  season: "summer",
  tags: ["Boho", "Warm", "Summer", "Festival"],
  vars: {
    "--theme-bg": "#F3E7CE",
    "--theme-text": "#4A3818",
    "--theme-accent": "#D68A2E",
    "--theme-font-heading": "var(--font-fraunces), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-bg-texture": "url('/patterns/leaves.svg')",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
