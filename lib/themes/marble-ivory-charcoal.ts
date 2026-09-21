import type { Theme } from "./types";

// A plainer, more neutral "Carrara marble" take -- warm ivory rather than
// tied to one specific decor asset's exact hue, for roster variety.
export const marbleIvoryCharcoal: Theme = {
  id: "marble-ivory-charcoal",
  name: "Ivory & Charcoal Marble",
  category: "marble",
  tags: ["Marble", "Elegant", "Neutral"],
  vars: {
    "--theme-bg": "#F5F1E8",
    "--theme-text": "#332E28",
    "--theme-accent": "#8C7C63",
    "--theme-font-heading": "var(--font-italiana), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
