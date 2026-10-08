import ThemeProvider from "@/components/theme/ThemeProvider";
import { HeroSection } from "@/components/sections/HeroSection";
import { LetterSection } from "@/components/sections/LetterSection";
import { TimelineSection } from "@/components/sections/TimelineSection";
import InvitationCardPreview from "@/components/paper/InvitationCardPreview";
import { getTheme } from "@/lib/themes";
import { effectiveDecorCategory } from "@/lib/themes/decorMotifs";
import { previewPhotoFor, previewTargetDateFor, formatPreviewDate } from "@/lib/themes/previewMedia";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";
import styles from "./HeroPhoneShowcase.module.css";

const SHOWCASE_NAMES: [string, string] = ["Claire", "Nathaniel"];

/** Hero-only exception to `previewPhotoFor`'s own rule (see
 * lib/themes/previewMedia.ts's file header): the 100-card theme gallery
 * deliberately never shows a posed couple, since that would misrepresent a
 * stock couple as *that specific theme's* real result. This single hero
 * mockup is a different context -- one marketing showcase, already paired
 * with the obviously-placeholder name "Claire & Nathaniel" everywhere else
 * on this page, not 100 cards each implicitly claiming "this is what you
 * get." A real, free-license Unsplash photo (same sourcing policy as every
 * other photo in this codebase -- man in black suit, woman in white dress,
 * hands held, elegant and uncluttered enough to carry the grayscale
 * treatment below), kept local to this file rather than added to the
 * shared THEME_PREVIEW_PHOTOS pool so the gallery's own no-couple-photos
 * rule stays intact everywhere else. */
const HERO_SHOWCASE_PHOTO = "https://images.unsplash.com/photo-1606495186270-395860907235";

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
// - Hero/victorian-cameo: the couple's real photo framed INSIDE an ornate
//   circular locket, not flooding the whole screen. Direct product-owner
//   correction, with their own real weddingpost.ru invitation as the
//   reference: an earlier version of this frame used photo-full-bleed --
//   on a real portrait photo, full-bleed `object-fit: cover` across an
//   entire phone screen crops unpredictably (confirmed live elsewhere in
//   the product: a portrait shot lost almost its whole subject to a wide/
//   short crop window) and reads as "a site showing off a cropped photo,"
//   not "a beautiful invitation." A second attempt used editorial-split
//   (photo in a plain bordered rectangle, closer to the actual reference
//   image) but that variant's CSS *restructures* at a real `min-width:
//   768px` media query (column -> row, centered -> right-aligned) -- this
//   component fakes a phone by `transform: scale()`-ing a 375px-wide div,
//   which doesn't change the REAL browser viewport `@media` evaluates
//   against, so on an actual desktop visit editorial-split flipped to its
//   desktop layout inside the shrunk mockup and overflowed/clipped text,
//   confirmed live. victorian-cameo's own breakpoints only scale sizes up
//   (16rem locket -> 20rem), never restructure, so it shrinks cleanly
//   inside this mockup at any real viewport width -- same safe shape
//   `photo-full-bleed` already had, with a real contained photo instead of
//   a full-bleed crop. Replaces an even earlier boho-asymmetric pick that
//   looked hand-picked-rich on paper but in practice confined its
//   illustrated vine to a thin strip down the right edge, leaving roughly
//   two-thirds of the frame bare tan background.
// - Letter/ornate-border: a framed, decorated card -- pairs naturally with
//   marble's dramatic dark palette.
// - Timeline/vertical-line: clean and legible at this small mockup size;
//   Timeline has no full-color illustrated decor system of its own (only
//   Hero/Letter/Gift/DressCode/Countdown do), so the decoration here comes
//   from provence's own soft palette rather than an added illustration.
const SHOWCASE_FRAMES = [
  {
    themeId: "romantic-rosewater",
    section: "hero" as const,
    variant: "victorian-cameo" as const,
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

/** Hero right column: a real Invimbo design shown live on a phone -- a
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

      <div className={styles.deviceWrap}>
          <div className={styles.device}>
            <div className={styles.dynamicIsland} aria-hidden="true" />
            <div className={styles.homeIndicator} aria-hidden="true" />
            <div className={styles.screen}>
              <div className={styles.urlBar}>
                <span className={styles.urlDot} aria-hidden="true" />
                <span className={styles.urlText}>yourname.com</span>
              </div>
              <div className={styles.screenScaleWrap} style={{ "--section-min-height": "812px" } as React.CSSProperties}>
                {SHOWCASE_FRAMES.map(({ themeId, section, variant, frameClass }) => {
                  const theme = getTheme(themeId);
                  const targetDate = previewTargetDateFor(theme.id, theme.season);
                  const dateLabel = formatPreviewDate(targetDate);

                  let content: React.ReactNode;
                  if (section === "hero") {
                    const rawPhoto: string =
                      (variant as string) === "victorian-cameo" || (variant as string) === "photo-full-bleed"
                        ? HERO_SHOWCASE_PHOTO
                        : previewPhotoFor(theme.id, theme.category);
                    const photoUrl = `${rawPhoto}?w=500&q=70&fit=crop&auto=format`;
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

          {/* landing-audit follow-up: "one style, everywhere" was only ever
              *said* in the hero copy, never *shown* -- weddingpost.ru proves it
              visually on every one of their own theme cards by pairing the
              phone with a matching paper invitation. Reuses the exact same
              InvitationCardPreview component the dashboard's Paper tab and
              SiteOrPaperSection already render (real product, not an
              illustration), synced to the same frame-cycle timing as the phone
              via the same frameBoho/frameArtDeco/frameWatercolor delay
              classes, so the card in view always matches the theme on screen. */}
          <div className={styles.paperStack} aria-hidden="true">
            {SHOWCASE_FRAMES.map(({ themeId, frameClass }) => {
              const theme = getTheme(themeId);
              const targetDate = previewTargetDateFor(theme.id, theme.season);
              const isoDate = targetDate.toISOString().slice(0, 10);
              return (
                <div key={themeId} className={`${styles.paperLayer} ${frameClass}`}>
                  <InvitationCardPreview theme={theme} names={SHOWCASE_NAMES} eventDate={isoDate} side="front" />
                </div>
              );
            })}
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
