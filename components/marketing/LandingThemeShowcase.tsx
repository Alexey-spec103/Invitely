"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeGalleryCard } from "@/components/theme/ThemeGallery";
import type { Theme } from "@/lib/themes";
import styles from "./LandingThemeShowcase.module.css";

/** Hand-picked, not the first 6 in array order -- one per a different
 * category/mood so the teaser reads as "look at the range" rather than
 * accidentally clustering (e.g. every romantic theme sorts together in
 * `lib/themes/index.ts`). All 6 were spot-checked against the crop-fix and
 * marketing chrome from the theme-gallery-card work and render cleanly. */
const SHOWCASE_THEME_IDS = [
  "romantic-blush",
  "boho-terracotta",
  "vintage-rosewood",
  "editorial-noir",
  "coastal-linen",
  "gilded-ivory",
] as const;

interface LandingThemeShowcaseProps {
  themes: Theme[];
}

/** The public landing page's "Choose your style" teaser: 6 cards, no
 * filters, no search -- weddingpost.ru's own homepage gallery is a bare
 * showcase too, the full filterable catalog only lives behind sign-up.
 * Reuses `ThemeGalleryCard` as-is (same phone mockup, same marketing
 * chrome) so this can never visually drift from the real gallery. */
export default function LandingThemeShowcase({ themes }: LandingThemeShowcaseProps) {
  const router = useRouter();
  const byId = new Map(themes.map((theme) => [theme.id, theme]));
  const showcaseThemes = SHOWCASE_THEME_IDS.map((id) => byId.get(id)).filter((theme): theme is Theme =>
    Boolean(theme)
  );

  return (
    <div className={styles.grid}>
      {showcaseThemes.map((theme, index) => {
        const isLast = index === showcaseThemes.length - 1;
        return (
          <div key={theme.id} className={styles.tile}>
            <ThemeGalleryCard
              theme={theme}
              selected={false}
              onSelect={(themeId) => router.push(`/onboarding?theme=${themeId}`)}
            />
            {isLast && (
              <Link href="/onboarding" className={styles.moreOverlay} aria-label="See 100+ more styles">
                <span className={styles.moreOverlayBtn}>See 100+ more styles →</span>
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
