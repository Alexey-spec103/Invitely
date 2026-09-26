import { CORNER_PAIR_DECOR, CATEGORY_MASK_ACCENT } from "@/lib/themes/decorMotifs";
import type { ThemeCategory } from "@/lib/themes";
import styles from "./CardCornerDecor.module.css";

interface CardCornerDecorProps {
  themeCategory?: ThemeCategory;
  /** Envelope's return-address text sits top-left, so only the bottom-right
   * accent applies there -- every other paper card gets both corners. */
  corners?: "pair" | "bottomRightOnly";
}

/** Same twin-corner accent system already used across the website's own
 * sections (Letter's CenteredCard, Gift's SimpleList -- both read from
 * lib/themes/decorMotifs.ts's CORNER_PAIR_DECOR) -- factored into one
 * shared component here since every paper card preview needs the identical
 * treatment, rather than duplicating the img+mask-fallback markup six
 * times the way the site's own section variants each do independently.
 * Brings paper materials into the same per-theme decorative language the
 * live site already has, instead of the plain bordered rectangle every
 * card previously was. */
export default function CardCornerDecor({ themeCategory, corners = "pair" }: CardCornerDecorProps) {
  const flourishAssets = themeCategory ? CORNER_PAIR_DECOR[themeCategory] : undefined;
  const maskAccent = !flourishAssets && themeCategory ? CATEGORY_MASK_ACCENT[themeCategory] : undefined;
  const maskAccentStyle = maskAccent
    ? { maskImage: `url(${maskAccent})`, WebkitMaskImage: `url(${maskAccent})` }
    : undefined;

  if (flourishAssets) {
    return (
      <>
        {corners === "pair" && (
          <img className={styles.topLeft} src={flourishAssets[0]} alt="" aria-hidden="true" />
        )}
        <img className={styles.bottomRight} src={flourishAssets[1]} alt="" aria-hidden="true" />
      </>
    );
  }
  if (maskAccent) {
    return (
      <>
        {corners === "pair" && (
          <span className={styles.topLeftMask} style={maskAccentStyle} aria-hidden="true" />
        )}
        <span className={styles.bottomRightMask} style={maskAccentStyle} aria-hidden="true" />
      </>
    );
  }
  return null;
}
