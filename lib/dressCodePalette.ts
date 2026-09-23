/** Curated, popular wedding/event dress-code colors -- a quick-pick starting
 * point ("самые популярные и лучшие цвета для свадеб и мероприятий"), not a
 * replacement for picking any custom color: DressCodeColorsManager keeps its
 * own `<input type="color">` + hex field for that, this list just saves a
 * host from typing a hex code for the most commonly requested tones. */
export interface DressCodePaletteColor {
  hex: string;
  label: string;
}

export const DRESS_CODE_PALETTE: DressCodePaletteColor[] = [
  { hex: "#6B2737", label: "Burgundy" },
  { hex: "#1F3A5F", label: "Navy" },
  { hex: "#3E5C50", label: "Emerald" },
  { hex: "#7C9C8B", label: "Eucalyptus" },
  { hex: "#9CAF88", label: "Sage" },
  { hex: "#C08E82", label: "Dusty Rose" },
  { hex: "#E8C4C4", label: "Blush" },
  { hex: "#B4A7D6", label: "Lavender" },
  { hex: "#6E8FAB", label: "Dusty Blue" },
  { hex: "#C1633B", label: "Terracotta" },
  { hex: "#D4AF37", label: "Gold" },
  { hex: "#D9C7A3", label: "Champagne" },
  { hex: "#F5F0E8", label: "Ivory" },
  { hex: "#36454F", label: "Charcoal" },
];
