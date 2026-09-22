import ThemeProvider from "@/components/theme/ThemeProvider";
import { HeroSection, HERO_VARIANTS, DEFAULT_HERO_VARIANT } from "@/components/sections/HeroSection";
import type { HeroVariant } from "@/components/sections/HeroSection";
import InvitationCardPreview from "@/components/paper/InvitationCardPreview";
import EnvelopeCardPreview from "@/components/paper/EnvelopeCardPreview";
import { getTheme } from "@/lib/themes";
import { recommendedHeroVariantFor } from "@/lib/themes/recommendedHeroVariant";
import { previewPhotoFor, previewTargetDateFor, formatPreviewDate } from "@/lib/themes/previewMedia";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";
import styles from "./SiteOrPaperSection.module.css";

// Same theme + couple as the rest of the landing page, for the same "one
// style, everywhere" reason as PlatformFanSection/HeroPhoneShowcase.
const SHOWCASE_THEME_ID = "romantic-blush";
const SHOWCASE_NAMES: [string, string] = ["Claire", "Nathaniel"];

/** weddingpost.ru's "site and/or paper" choice (step 5 of their "how it
 * works") -- two live product panels, not photos: the same real HeroSection
 * rendered twice at laptop + phone size on the left, and the same real
 * InvitationCardPreview/EnvelopeCardPreview used elsewhere on this page
 * stacked on the right. See docs/research/landing-audit.md priority 10. */
export default function SiteOrPaperSection({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).landing.siteOrPaper;
  const theme = getTheme(SHOWCASE_THEME_ID);
  const recommended = recommendedHeroVariantFor(theme.id, theme.category);
  const heroVariant: HeroVariant = HERO_VARIANTS.includes(recommended as HeroVariant)
    ? (recommended as HeroVariant)
    : DEFAULT_HERO_VARIANT;
  const photoUrl = `${previewPhotoFor(theme.id, theme.category)}?w=500&q=70&fit=crop&auto=format`;
  const targetDate = previewTargetDateFor(theme.id, theme.season);
  const dateLabel = formatPreviewDate(targetDate);
  const isoDate = targetDate.toISOString().slice(0, 10);

  const heroContent = (
    <ThemeProvider theme={theme}>
      <HeroSection variant={heroVariant} names={SHOWCASE_NAMES} eventDate={dateLabel} photoUrl={photoUrl} />
    </ThemeProvider>
  );

  return (
    <div className={styles.layout}>
      <h2 className={styles.heading}>{t.heading}</h2>
      <p className={styles.subtext}>{t.subtext}</p>

      <div className={styles.columns}>
        <div className={styles.column}>
          <div className={styles.devices}>
            <div className={styles.laptop}>
              <div className={styles.laptopScreen}>
                <div className={styles.laptopScaleWrap}>
                  <div className={styles.laptopScaleInner}>{heroContent}</div>
                </div>
              </div>
              <div className={styles.laptopBase} aria-hidden="true" />
            </div>
            <div className={styles.phone}>
              <div className={styles.phoneBezel}>
                <span className={styles.phoneNotch} aria-hidden="true" />
                <div className={styles.phoneScreen}>
                  <div className={styles.phoneScaleWrap}>
                    <div className={styles.phoneScaleInner}>{heroContent}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h3 className={styles.columnTitle}>{t.website.title}</h3>
          <p className={styles.columnSubtext}>{t.website.subtext}</p>
          <ul className={styles.bullets}>
            {t.website.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>

        <div className={styles.orBadge} aria-hidden="true">
          {t.orBadge}
        </div>

        <div className={styles.column}>
          <div className={styles.paperStack}>
            <div className={`${styles.paperItem} ${styles.envelope}`}>
              <EnvelopeCardPreview theme={theme} names={SHOWCASE_NAMES} eventDate={isoDate} />
            </div>
            <div className={`${styles.paperItem} ${styles.invitation}`}>
              <InvitationCardPreview theme={theme} names={SHOWCASE_NAMES} eventDate={isoDate} side="front" />
            </div>
          </div>
          <h3 className={styles.columnTitle}>{t.paper.title}</h3>
          <p className={styles.columnSubtext}>{t.paper.subtext}</p>
          <ul className={styles.bullets}>
            {t.paper.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
