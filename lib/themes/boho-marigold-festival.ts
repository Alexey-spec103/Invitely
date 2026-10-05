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
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.27:1 against this theme's own #F3E7CE bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.07:1.
    "--theme-accent": "#B77524",
    "--theme-font-heading": "var(--font-fraunces), var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
