import ThemeProvider from "@/components/theme/ThemeProvider";
import { HeroSection, HERO_VARIANTS, DEFAULT_HERO_VARIANT } from "@/components/sections/HeroSection";
import type { HeroVariant } from "@/components/sections/HeroSection";
import { LetterSection } from "@/components/sections/LetterSection";
import { TimelineSection } from "@/components/sections/TimelineSection";
import { getTheme } from "@/lib/themes";
import { recommendedHeroVariantFor } from "@/lib/themes/recommendedHeroVariant";
import { previewPhotoFor, previewTargetDateFor, formatPreviewDate } from "@/lib/themes/previewMedia";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";
import styles from "./HeroPhoneShowcase.module.css";

// Same "lead with our newest, most colorful work" call as
// LandingThemeShowcase.tsx and lib/themes/index.ts's POPULAR_THEME_IDS --
// this phone mockup is the single most prominent visual on the whole
// landing page (above the fold, animates through 3 real sections), so it
// especially shouldn't be showing the plain original default theme.
const SHOWCASE_THEME_ID = "boho-marigold-festival";
const SHOWCASE_NAMES: [string, string] = ["Claire", "Nathaniel"];

// Real, finished copy for the Letter/Timeline frames -- matching the same
// couple/date as the Hero frame, never lorem-ipsum placeholder text, since
// the whole point of this showcase is "here's what a real Invitely site
// actually says," not a generic mockup.
const LETTER_CONTENT = {
  title: "A Letter to Our Guests",
  body: "From our very first date to this moment, every step led us here — and we can't wait to celebrate with the people who mean the most to us.",
  quote:
    "Love is not about how many days, months, or years you've been together. It's about how much you love each other every single day.",
  note: "With so much love,",
  closingLine: "Claire & Nathaniel",
};

const TIMELINE_CONTENT = {
  title: "Timeline",
  events: [
    { time: "3:00 PM", title: "Guests Arrive", description: "Welcome drinks on the terrace" },
    { time: "4:00 PM", title: "Ceremony", description: "Exchange of vows under the oak trees" },
    { time: "5:30 PM", title: "Cocktail Hour", description: "Canapés & champagne toasts" },
    { time: "7:00 PM", title: "Reception & Dinner", description: "Dinner, speeches, and first dance" },
  ],
};

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
 * sections (Hero -> Letter -> Timeline) as if a guest were scrolling
 * through the invitation -- a soft fade/slide/blur crossfade (no JS timers,
 * so it costs nothing at runtime and respects prefers-reduced-motion), plus
 * a small decorative "tap" cursor and shine sweep at each transition so it
 * reads as an interactive product, not a slideshow. */
export default function HeroPhoneShowcase({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).landing.heroPhoneShowcase;
  const theme = getTheme(SHOWCASE_THEME_ID);
  const recommended = recommendedHeroVariantFor(theme.id, theme.category);
  const heroVariant: HeroVariant = HERO_VARIANTS.includes(recommended as HeroVariant)
    ? (recommended as HeroVariant)
    : DEFAULT_HERO_VARIANT;
  const photoUrl = `${previewPhotoFor(theme.id, theme.category)}?w=500&q=70&fit=crop&auto=format`;
  const targetDate = previewTargetDateFor(theme.id, theme.season);
  const dateLabel = formatPreviewDate(targetDate);

  // Always a month before the showcased wedding date, whatever that date
  // happens to be for this theme/season -- never a hardcoded date that
  // could land after the "wedding" itself and read as backwards.
  const rsvpDeadlineDate = new Date(targetDate);
  rsvpDeadlineDate.setMonth(rsvpDeadlineDate.getMonth() - 1);
  const rsvpDeadline = rsvpDeadlineDate.toISOString().slice(0, 10);

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
            <div className={`${styles.frameLayer} ${styles.frameHero}`}>
              <div className={styles.screenScaleInner}>
                <ThemeProvider theme={theme}>
                  <HeroSection variant={heroVariant} names={SHOWCASE_NAMES} eventDate={dateLabel} photoUrl={photoUrl} />
                </ThemeProvider>
              </div>
            </div>
            <div className={`${styles.frameLayer} ${styles.frameLetter}`}>
              <div className={styles.screenScaleInner}>
                <ThemeProvider theme={theme}>
                  <LetterSection variant="centered-card" rsvpDeadline={rsvpDeadline} locale={locale} {...LETTER_CONTENT} />
                </ThemeProvider>
              </div>
            </div>
            <div className={`${styles.frameLayer} ${styles.frameTimeline}`}>
              <div className={styles.screenScaleInner}>
                <ThemeProvider theme={theme}>
                  <TimelineSection variant="vertical-line" {...TIMELINE_CONTENT} />
                </ThemeProvider>
              </div>
            </div>
            <span className={styles.shineSweep} aria-hidden="true" />
            <span className={styles.tapCursor} aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className={styles.progressDots} aria-hidden="true">
        <span className={`${styles.progressDot} ${styles.progressDotHero}`} />
        <span className={`${styles.progressDot} ${styles.progressDotLetter}`} />
        <span className={`${styles.progressDot} ${styles.progressDotTimeline}`} />
      </div>

      <p className={styles.bottomCaption}>{t.bottomCaption}</p>
    </div>
  );
}
