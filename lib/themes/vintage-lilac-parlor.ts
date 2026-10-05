import type { Theme } from "./types";

// A pale lilac vintage theme -- softer and pinker-purple than Dusty Plum,
// for a spring parlor-tea-party register.
export const vintageLilacParlor: Theme = {
  id: "vintage-lilac-parlor",
  name: "Lilac Parlor",
  category: "vintage",
  season: "spring",
  tags: ["Vintage", "Romantic", "Spring", "Antique"],
  vars: {
    "--theme-bg": "#F1ECEF",
    "--theme-text": "#3B3441",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.62:1 against this theme's own #F1ECEF bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.03:1.
    "--theme-accent": "#967FAD",
    "--theme-font-heading": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), var(--font-caveat), cursive",
  },
};
