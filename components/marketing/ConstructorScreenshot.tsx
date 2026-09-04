import ThemeProvider from "@/components/theme/ThemeProvider";
import { HeroSection, HERO_VARIANTS, DEFAULT_HERO_VARIANT } from "@/components/sections/HeroSection";
import type { HeroVariant } from "@/components/sections/HeroSection";
import { getTheme } from "@/lib/themes";
import { recommendedHeroVariantFor } from "@/lib/themes/recommendedHeroVariant";
import { previewPhotoFor, previewTargetDateFor, formatPreviewDate } from "@/lib/themes/previewMedia";
import styles from "./ConstructorScreenshot.module.css";

// Same theme + couple as the rest of the landing page (hero, platform-fan
// section) -- the laptop screenshot below was captured from a real demo
// event built with this exact theme, so the phone here showing the same
// design isn't a coincidence, it's the point: one style, everywhere.
const SHOWCASE_THEME_ID = "romantic-blush";
const SHOWCASE_NAMES: [string, string] = ["Claire", "Nathaniel"];

/** Real product, not an illustration: the laptop panel is an actual
 * screenshot of Invitely's own Canvas editor (captured from a real demo
 * event, /public/marketing/constructor-screenshot.png), not a CSS drawing
 * pretending to be one. The phone panel reuses the same live-rendered
 * HeroSection technique as HeroPhoneShowcase/PlatformFanSection so it can
 * never drift out of sync with what the constructor actually produces. */
export default function ConstructorScreenshot() {
  const theme = getTheme(SHOWCASE_THEME_ID);
  const recommended = recommendedHeroVariantFor(theme.id, theme.category);
  const heroVariant: HeroVariant = HERO_VARIANTS.includes(recommended as HeroVariant)
    ? (recommended as HeroVariant)
    : DEFAULT_HERO_VARIANT;
  const photoUrl = `${previewPhotoFor(theme.id, theme.category)}?w=500&q=70&fit=crop&auto=format`;
  const targetDate = previewTargetDateFor(theme.id, theme.season);
  const dateLabel = formatPreviewDate(targetDate);

  return (
    <div className={styles.wrap}>
      <div className={styles.laptop}>
        <div className={styles.laptopScreen}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/marketing/constructor-screenshot.png"
            alt="Invitely's real canvas editor: style rail, design canvas, and layers panel"
            className={styles.laptopImg}
          />
        </div>
        <div className={styles.laptopBase} aria-hidden="true" />
      </div>

      <div className={styles.phone}>
        <div className={styles.phoneBezel}>
          <span className={styles.phoneNotch} aria-hidden="true" />
          <div className={styles.phoneScreen}>
            <div className={styles.phoneScaleWrap}>
              <div className={styles.phoneScaleInner}>
                <ThemeProvider theme={theme}>
                  <HeroSection variant={heroVariant} names={SHOWCASE_NAMES} eventDate={dateLabel} photoUrl={photoUrl} />
                </ThemeProvider>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
