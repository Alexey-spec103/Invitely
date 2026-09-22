import ThemeProvider from "@/components/theme/ThemeProvider";
import { HeroSection } from "@/components/sections/HeroSection";
import { getTheme } from "@/lib/themes";
import { effectiveDecorCategory } from "@/lib/themes/decorMotifs";
import { previewPhotoFor, previewTargetDateFor, formatPreviewDate } from "@/lib/themes/previewMedia";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";
import styles from "./HeroPhoneShowcase.module.css";

const SHOWCASE_NAMES: [string, string] = ["Claire", "Nathaniel"];

// Three real, decorated designs -- not the single auto-"recommended" variant
// per theme (that pick can land on a deliberately sparse composition like
// hand-lettering, which showed literally no illustrated decoration at all
// on this exact showcase -- confirmed live, that's what prompted this
// rewrite). Each entry below is hand-picked for a variant genuinely rich in
// decoration for that theme, not whatever recommendedHeroVariantFor()
// would have guessed:
// - boho-asymmetric: a full-height illustrated vine framing the whole
//   screen (needs `themeCategory` passed -- BohoAsymmetric.tsx falls back
//   to a plain tinted mask without it, another thing the previous version
//   got wrong by never passing themeCategory here at all).
// - art-deco-crest: pure-CSS geometric zigzag bands + crest, always
//   present regardless of category -- pairs naturally with marble's
//   dramatic dark palette.
// - watercolor-botanical: a CSS-masked branch illustration, always present
//   regardless of category, tinted to the theme's own accent color.
const SHOWCASE_FRAMES = [
  {
    themeId: "boho-marigold-festival",
    variant: "boho-asymmetric" as const,
    frameClass: styles.frameBoho,
    dotClass: styles.progressDotBoho,
  },
  {
    themeId: "marble-noir-rust",
    variant: "art-deco-crest" as const,
    frameClass: styles.frameArtDeco,
    dotClass: styles.progressDotArtDeco,
  },
  {
    themeId: "provence-lavender-sage",
    variant: "watercolor-botanical" as const,
    frameClass: styles.frameWatercolor,
    dotClass: styles.progressDotWatercolor,
  },
];

/** Hero right column: a real Invitely design shown live on a phone -- a
 * clean, modern bezel-less mockup (no physical home button, styled like
 * iPhone 14+ with a Dynamic-Island-style cutout) rather than a stock photo
 * of a hand holding an old rounded iPhone. Same real-component +
 * container-query scale-to-fit technique as ThemeGallery's card phone
 * mockup, so this can never drift out of sync with what the constructor
 * actually produces, and the on-screen copy is always a real theme's real
 * words -- never lorem-ipsum placeholder text.
 *
 * landing-audit.md brand pass: instead of a static screenshot or a real
 * video file, a pure-CSS looped animation auto-advances through three real
 * *designs* (not three sections of one design -- see SHOWCASE_FRAMES'
 * comment above for why) as if a visitor were browsing the style catalog --
 * a soft fade/slide/blur crossfade (no JS timers, so it costs nothing at
 * runtime and respects prefers-reduced-motion), plus a small decorative
 * "tap" cursor and shine sweep at each transition so it reads as an
 * interactive product, not a slideshow. */
export default function HeroPhoneShowcase({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).landing.heroPhoneShowcase;

  return (
    <div className={styles.stage}>
      <p className={styles.topCaption}>{t.topCaption}</p>

      <div className={styles.device}>
        <div className={styles.dynamicIsland} aria-hidden="true" />
        <div className={styles.homeIndicator} aria-hidden="true" />
        <div className={styles.screen}>
          <div className={styles.urlBar}>
            <span className={styles.urlDot} aria-hidden="true" />
            <span className={styles.urlText}>yourname.com</span>
          </div>
          <div className={styles.screenScaleWrap}>
            {SHOWCASE_FRAMES.map(({ themeId, variant, frameClass }) => {
              const theme = getTheme(themeId);
              const photoUrl = `${previewPhotoFor(theme.id, theme.category)}?w=500&q=70&fit=crop&auto=format`;
              const targetDate = previewTargetDateFor(theme.id, theme.season);
              const dateLabel = formatPreviewDate(targetDate);
              return (
                <div key={themeId} className={`${styles.frameLayer} ${frameClass}`}>
                  <div className={styles.screenScaleInner}>
                    <ThemeProvider theme={theme}>
                      <HeroSection
                        variant={variant}
                        names={SHOWCASE_NAMES}
                        eventDate={dateLabel}
                        photoUrl={photoUrl}
                        themeCategory={effectiveDecorCategory(theme)}
                      />
                    </ThemeProvider>
                  </div>
                </div>
              );
            })}
            <span className={styles.shineSweep} aria-hidden="true" />
            <span className={styles.tapCursor} aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className={styles.progressDots} aria-hidden="true">
        {SHOWCASE_FRAMES.map(({ themeId, dotClass }) => (
          <span key={themeId} className={`${styles.progressDot} ${dotClass}`} />
        ))}
      </div>

      <p className={styles.bottomCaption}>{t.bottomCaption}</p>
    </div>
  );
}
