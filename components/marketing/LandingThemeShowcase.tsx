"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeGalleryCard } from "@/components/theme/ThemeGallery";
import type { Theme } from "@/lib/themes";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";
import styles from "./LandingThemeShowcase.module.css";

interface LandingThemeShowcaseProps {
  /** Already filtered to SHOWCASE_THEME_IDS (landingThemeShowcaseIds.ts) by
   * the caller -- 2026-10-16 performance audit: the caller used to pass all
   * ~124 themes (Object.values(themes)) as a prop to this "use client"
   * component, which only ever rendered 9 of them -- every other theme's
   * full data (colors, fonts, decor refs, every category's metadata) still
   * had to serialize into the RSC payload and hydrate on the client for
   * nothing. A large unused hydration payload is a textbook INP/TTI cost
   * (Clarity RUM flagged landing-page INP as "needs improvement"), not just
   * wasted bytes. SHOWCASE_THEME_IDS itself lives in a plain (non-"use
   * client") sibling file so the Server Component caller can import the
   * real array -- importing a non-component named export from a "use
   * client" file into a Server Component resolves to a client-reference
   * proxy, not the actual value (confirmed live: threw
   * "SHOWCASE_THEME_IDS.map is not a function" at runtime despite
   * type-checking cleanly). */
  themes: Theme[];
  /** Total theme count minus however many are already shown in this
   * showcase -- UX audit (2026-10-26): the "see more styles" overlay used
   * to hardcode "100+", stale against the real count and never passed
   * through `seeMoreStyles`. */
  remainingCount: number;
  /** UX audit (2026-10-26): this component never received `locale` at all,
   * so `ThemeGalleryCard` silently fell back to English on every one of the
   * 7 non-English homepage locales (confirmed live: "Add to calendar",
   * "DAYS/HOURS/MINUTES" etc. stayed English on /de, /fr while every other
   * section translated correctly) -- the one untranslated seam on an
   * otherwise fully localized page. */
  locale: Locale;
}

/** The public landing page's "Choose your style" teaser: 6 cards, no
 * filters, no search -- weddingpost.ru's own homepage gallery is a bare
 * showcase too, the full filterable catalog only lives behind sign-up.
 * Reuses `ThemeGalleryCard` as-is (same phone mockup, same marketing
 * chrome) so this can never visually drift from the real gallery. */
export default function LandingThemeShowcase({ themes: showcaseThemes, remainingCount, locale }: LandingThemeShowcaseProps) {
  const router = useRouter();
  const t = getDictionary(locale).landing.themesSection;

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
              locale={locale}
            />
            {isLast && (
              <Link href="/onboarding" className={styles.moreOverlay} aria-label={t.seeMoreStyles(remainingCount)}>
                <span className={styles.moreOverlayBtn}>{t.seeMoreStyles(remainingCount)}</span>
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
