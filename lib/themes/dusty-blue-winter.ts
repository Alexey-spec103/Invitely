import type { Theme } from "./types";

// A genuinely cold-toned palette — every existing theme's neutrals lean
// warm/taupe or true monochrome; this is the first blue-grey base in the
// catalog, suited to a winter or evening formal wedding.
export const dustyBlueWinter: Theme = {
  id: "dusty-blue-winter",
  name: "Dusty Blue Winter",
  category: "minimal",
  season: "winter",
  tags: ["Winter", "Minimal", "Modern", "Marble"],
  vars: {
    "--theme-bg": "#E4E9ED",
    "--theme-text": "#26313D",
    "--theme-accent": "#5C7A99",
    "--theme-font-heading": "var(--font-fraunces), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-accent": "var(--font-fraunces), Georgia, serif",
    "--theme-bg-texture": "url('/patterns/grain-light.svg')",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
