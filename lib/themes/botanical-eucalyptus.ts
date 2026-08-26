import type { Theme } from "./types";

// A cooler blue-green botanical theme -- Fraunces headings for a slightly
// more editorial feel than the classic serif botanical themes.
export const botanicalEucalyptus: Theme = {
  id: "botanical-eucalyptus",
  name: "Eucalyptus",
  category: "botanical",
  season: "spring",
  tags: ["Botanical", "Modern", "Spring", "Eucalyptus"],
  vars: {
    "--theme-bg": "#E9EEEA",
    "--theme-text": "#364039",
    "--theme-accent": "#7C9C8B",
    "--theme-font-heading": "var(--font-fraunces), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-bg-texture": "url('/patterns/leaves.svg')",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
