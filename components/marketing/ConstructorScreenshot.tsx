import ThemeProvider from "@/components/theme/ThemeProvider";
import { HeroSection } from "@/components/sections/HeroSection";
import { getTheme } from "@/lib/themes";
import { effectiveDecorCategory } from "@/lib/themes/decorMotifs";
import { previewPhotoFor, previewTargetDateFor, formatPreviewDate } from "@/lib/themes/previewMedia";
import styles from "./ConstructorScreenshot.module.css";

// Same theme + couple as the rest of the landing page (hero, platform-fan
// section) -- one style, everywhere.
const SHOWCASE_THEME_ID = "peony-blush-burgundy";
const SHOWCASE_NAMES: [string, string] = ["Claire", "Nathaniel"];

// Hand-picked, NOT `recommendedHeroVariantFor` -- the same trap
// HeroPhoneShowcase's own SHOWCASE_FRAMES comment warns about (confirmed
// live here too: peony's recommended pick rendered as a completely flat,
// undecorated pink background). `watercolor-bloom` is the one peony variant
// with real illustrated decor (WATERCOLOR_BLOOM_DECOR has a peony entry) --
// it only picks that decor up when `themeCategory` is actually passed
// through, which the recommended-variant path here never did.
const SHOWCASE_HERO_VARIANT = "watercolor-bloom" as const;

/** Real product, not an illustration: both panels are the actual, live
 * HeroSection component (same technique HeroPhoneShowcase/PlatformFanSection/
 * SiteOrPaperSection already use) -- never a static screenshot of the editor
 * chrome. Deliberate choice after direct feedback: this section used to lead
 * with a screenshot of the Canvas editor itself ("Not just a theme picker --
 * a canvas"), which put the *tool* front and center. The point that actually
 * matters to a couple is the *finished result* -- so both the laptop and the
 * phone now show the same completed, polished design, exactly like
 * SiteOrPaperSection's own laptop+phone pair. */
export default function ConstructorScreenshot() {
  const theme = getTheme(SHOWCASE_THEME_ID);
  const photoUrl = `${previewPhotoFor(theme.id, theme.category)}?w=500&q=70&fit=crop&auto=format`;
  const targetDate = previewTargetDateFor(theme.id, theme.season);
  const dateLabel = formatPreviewDate(targetDate);

  const heroContent = (
    <ThemeProvider theme={theme}>
      <HeroSection
        variant={SHOWCASE_HERO_VARIANT}
        names={SHOWCASE_NAMES}
        eventDate={dateLabel}
        photoUrl={photoUrl}
        themeCategory={effectiveDecorCategory(theme)}
      />
    </ThemeProvider>
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.laptop}>
        <div className={styles.laptopScreen}>
          <div className={styles.laptopScaleWrap} style={{ "--section-min-height": "812px" } as React.CSSProperties}>
            <div className={styles.laptopScaleInner}>{heroContent}</div>
          </div>
        </div>
        <div className={styles.laptopBase} aria-hidden="true" />
      </div>

      <div className={styles.phone}>
        <div className={styles.phoneBezel}>
          <span className={styles.phoneNotch} aria-hidden="true" />
          <div className={styles.phoneScreen}>
            <div className={styles.phoneScaleWrap} style={{ "--section-min-height": "812px" } as React.CSSProperties}>
              <div className={styles.phoneScaleInner}>{heroContent}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
