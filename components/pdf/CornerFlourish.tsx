import { Svg, Path } from "@react-pdf/renderer";

/** Same delicate sprig as the web's `/patterns/corner-flourish.svg` (the
 * corner ornament on LetterSection's CenteredCard and every other paper
 * card preview's `CardCornerDecor`), redrawn as react-pdf `Path`
 * primitives -- react-pdf's SVG support has no `mask-image`/`currentColor`,
 * and can't load an arbitrary external SVG file the way an HTML `<img>`
 * can, so the paths are duplicated here with the theme's accent baked in
 * as a literal `stroke`/`fill` instead. This is deliberately the single
 * generic sprig, not each theme's own richly-illustrated corner motif
 * (lib/themes/decorMotifs.ts's CORNER_PAIR_DECOR) -- react-pdf genuinely
 * cannot render those assets, and hand-redrawing 12+ per-category
 * illustrations as Path data would be a large, fragile undertaking for a
 * renderer that can't even preview them. One theme-accent-tinted motif,
 * used consistently across every PDF document, is the honest option this
 * renderer actually supports. Originally local to InvitationDocument.tsx;
 * factored out here once EnvelopeDocument/TableCardDocument/
 * PlaceCardDocument/TableNumberCardDocument/DressCodeCardDocument all
 * needed the identical shape. */
export function CornerFlourish({ color, rotate, size = 40 }: { color: string; rotate?: number; size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      <Path
        d="M4 4 C 20 6, 34 14, 40 30 C 44 40, 42 50, 34 56"
        stroke={color}
        strokeWidth={1}
        strokeLinecap="round"
      />
      <Path
        d="M10 4 C 22 8, 30 16, 33 26"
        stroke={color}
        strokeWidth={0.75}
        strokeLinecap="round"
        opacity={0.7}
      />
      <Path d="M14 18 C 10 14, 9 9, 12 5 C 15 9, 15 14, 14 18 Z" fill={color} opacity={0.8} />
      <Path d="M26 34 C 21 32, 17 33, 14 37 C 18 39, 23 39, 26 34 Z" fill={color} opacity={0.7} />
      <Path d="M36 46 C 31 45, 27 47, 25 51 C 29 52, 34 51, 36 46 Z" fill={color} opacity={0.6} />
    </Svg>
  );
}

/** Shared absolute-position styles for the two corners -- every document
 * places this identically (20pt inset from the page edge), so the
 * StyleSheet fragment lives here too instead of being retyped per file. */
export const cornerFlourishStyles = {
  flourishTopLeft: {
    position: "absolute" as const,
    top: 16,
    left: 16,
  },
  flourishBottomRight: {
    position: "absolute" as const,
    bottom: 16,
    right: 16,
  },
};
