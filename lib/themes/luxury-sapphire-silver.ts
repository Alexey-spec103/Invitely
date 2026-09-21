import type { Theme } from "./types";

// A near-black sapphire-blue luxury theme -- distinct from Regal Navy &
// Gold's warmer gold accent, this pairs the deep blue with cool silver instead.
export const luxurySapphireSilver: Theme = {
  id: "luxury-sapphire-silver",
  name: "Sapphire & Silver",
  category: "luxury",
  season: "winter",
  tags: ["Luxury", "Dark", "Winter", "Dark Background"],
  vars: {
    "--theme-bg": "#0D1420",
    "--theme-text": "#EAEEF3",
    "--theme-accent": "#6E93C2",
    "--theme-font-heading": "var(--font-marcellus), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
