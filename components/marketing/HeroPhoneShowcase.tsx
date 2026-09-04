import ThemeProvider from "@/components/theme/ThemeProvider";
import { HeroSection, HERO_VARIANTS, DEFAULT_HERO_VARIANT } from "@/components/sections/HeroSection";
import type { HeroVariant } from "@/components/sections/HeroSection";
import { getTheme } from "@/lib/themes";
import { recommendedHeroVariantFor } from "@/lib/themes/recommendedHeroVariant";
import { previewPhotoFor, previewTargetDateFor, formatPreviewDate } from "@/lib/themes/previewMedia";
import styles from "./HeroPhoneShowcase.module.css";

const SHOWCASE_THEME_ID = "romantic-blush";
const SHOWCASE_NAMES: [string, string] = ["Claire", "Nathaniel"];

/** Hero right column: a real Invitely design shown live on a phone, inside a
 * warm, homey photo -- not a stock wedding photo with nothing of the product
 * on it. Same real-component + container-query scale-to-fit technique as
 * ThemeGallery's card phone mockup, so this can never drift out of sync with
 * what the constructor actually produces. */
export default function HeroPhoneShowcase() {
  const theme = getTheme(SHOWCASE_THEME_ID);
  const recommended = recommendedHeroVariantFor(theme.id, theme.category);
  const variant: HeroVariant = HERO_VARIANTS.includes(recommended as HeroVariant)
    ? (recommended as HeroVariant)
    : DEFAULT_HERO_VARIANT;
  const photoUrl = `${previewPhotoFor(theme.id, theme.category)}?w=500&q=70&fit=crop&auto=format`;
  const targetDate = previewTargetDateFor(theme.id, theme.season);
  const dateLabel = formatPreviewDate(targetDate);

  return (
    <div className={styles.frame}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://images.unsplash.com/photo-1677849242259-96ed061c3817?w=1000&q=80"
        alt="A real Invitely invitation design, shown live on a phone"
        className={styles.bgPhoto}
      />

      <div className={styles.screen}>
        <div className={styles.urlBar}>
          <span className={styles.urlDot} aria-hidden="true" />
          <span className={styles.urlText}>yourname.com</span>
        </div>
        <div className={styles.screenScaleWrap}>
          <div className={styles.screenScaleInner}>
            <ThemeProvider theme={theme}>
              <HeroSection variant={variant} names={SHOWCASE_NAMES} eventDate={dateLabel} photoUrl={photoUrl} />
            </ThemeProvider>
          </div>
        </div>
      </div>

      <p className={styles.topCaption}>Brides of 2027, you&apos;re going to love this 🥹💍</p>
      <p className={styles.bottomCaption}>The invitations your friends will screenshot</p>
    </div>
  );
}
