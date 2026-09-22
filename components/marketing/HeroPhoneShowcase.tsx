import ThemeProvider from "@/components/theme/ThemeProvider";
import { HeroSection } from "@/components/sections/HeroSection";
import { LetterSection } from "@/components/sections/LetterSection";
import { TimelineSection } from "@/components/sections/TimelineSection";
import { getTheme } from "@/lib/themes";
import { effectiveDecorCategory } from "@/lib/themes/decorMotifs";
import { previewPhotoFor, previewTargetDateFor, formatPreviewDate } from "@/lib/themes/previewMedia";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";
import styles from "./HeroPhoneShowcase.module.css";

const SHOWCASE_NAMES: [string, string] = ["Claire", "Nathaniel"];

// Real, finished copy for the Letter/Timeline frames -- never lorem-ipsum
// placeholder text, matching the same couple across every frame regardless
// of which theme/section that frame happens to show.
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

// Three real, decorated designs, each showing a DIFFERENT section type --
// combines two earlier iterations of this component rather than picking one:
// the original version cycled Hero->Letter->Timeline of one single theme
// (showed section variety, not design variety); the version right before
// this one cycled three themes' Hero only (showed design variety, not
// section variety -- "only shows the main page," per direct feedback).
// Each entry is hand-picked for a variant genuinely rich in decoration, not
// whatever the recommended-variant algorithm would have guessed (confirmed
// live -- boho-marigold-festival's own recommended Hero variant rendered
// with zero illustrated decoration at all, which is what prompted picking
// explicit variants everywhere in this file rather than trusting the
// per-theme "recommended" pick for a showcase specifically):
// - Hero/boho-asymmetric: a full-height illustrated vine framing the whole
//   screen (needs `themeCategory` passed -- BohoAsymmetric.tsx falls back
//   to a plain tinted mask without it).
// - Letter/ornate-border: a framed, decorated card -- pairs naturally with
//   marble's dramatic dark palette.
// - Timeline/vertical-line: clean and legible at this small mockup size;
//   Timeline has no full-color illustrated decor system of its own (only
//   Hero/Letter/Gift/DressCode/Countdown do), so the decoration here comes
//   from provence's own soft palette rather than an added illustration.
const SHOWCASE_FRAMES = [
  {
    themeId: "boho-marigold-festival",
    section: "hero" as const,
    variant: "boho-asymmetric" as const,
    frameClass: styles.frameBoho,
    dotClass: styles.progressDotBoho,
  },
  {
    themeId: "marble-noir-rust",
    section: "letter" as const,
    variant: "ornate-border" as const,
    frameClass: styles.frameArtDeco,
    dotClass: styles.progressDotArtDeco,
  },
  {
    themeId: "provence-lavender-sage",
    section: "timeline" as const,
    variant: "vertical-line" as const,
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
 * designs, each a different section type (see SHOWCASE_FRAMES' comment
 * above) as if a visitor were browsing both the style catalog and a real
 * invitation's different pages -- a soft fade/slide/blur crossfade (no JS
 * timers, so it costs nothing at runtime and respects
 * prefers-reduced-motion), plus a small decorative "tap" cursor and shine
 * sweep at each transition so it reads as an interactive product, not a
 * slideshow. */
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
            {SHOWCASE_FRAMES.map(({ themeId, section, variant, frameClass }) => {
              const theme = getTheme(themeId);
              const targetDate = previewTargetDateFor(theme.id, theme.season);
              const dateLabel = formatPreviewDate(targetDate);

              let content: React.ReactNode;
              if (section === "hero") {
                const photoUrl = `${previewPhotoFor(theme.id, theme.category)}?w=500&q=70&fit=crop&auto=format`;
                content = (
                  <HeroSection
                    variant={variant}
                    names={SHOWCASE_NAMES}
                    eventDate={dateLabel}
                    photoUrl={photoUrl}
                    themeCategory={effectiveDecorCategory(theme)}
                  />
                );
              } else if (section === "letter") {
                const rsvpDeadlineDate = new Date(targetDate);
                rsvpDeadlineDate.setMonth(rsvpDeadlineDate.getMonth() - 1);
                content = (
                  <LetterSection
                    variant={variant}
                    rsvpDeadline={rsvpDeadlineDate.toISOString().slice(0, 10)}
                    locale={locale}
                    {...LETTER_CONTENT}
                  />
                );
              } else {
                content = <TimelineSection variant={variant} {...TIMELINE_CONTENT} />;
              }

              return (
                <div key={themeId} className={`${styles.frameLayer} ${frameClass}`}>
                  <div className={styles.screenScaleInner}>
                    <ThemeProvider theme={theme}>{content}</ThemeProvider>
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
