"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeGalleryCard } from "@/components/theme/ThemeGallery";
import type { Theme } from "@/lib/themes";
import styles from "./LandingThemeShowcase.module.css";

/** Hand-picked, not the first N in array order -- spread across the newest
 * four categories (marble/cosmic/peony/provence: matched textures, full
 * decorative-asset coverage -- see `lib/themes/index.ts`'s POPULAR_THEME_IDS
 * comment for why those lead over the original launch batch now) so this
 * first-impression teaser reads as "look how rich this is" with real color
 * and decorative variety, rather than accidentally clustering one mood.
 * 9 (not 6) fills the 3-column grid to a clean 3 rows -- `.grid`'s layout
 * is plain `repeat(3, ...)` with no assumption baked in about the count. */
const SHOWCASE_THEME_IDS = [
  "cosmic-obsidian-starlight",
  "marble-noir-rust",
  "peony-blush-burgundy",
  "provence-lavender-sage",
  "marble-champagne-teal",
  "cosmic-plum-gold",
  "peony-terracotta-cream",
  "provence-coral-sage",
  "marble-onyx-sage",
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
