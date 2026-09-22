import ThemeProvider from "@/components/theme/ThemeProvider";
import { HeroSection, HERO_VARIANTS, DEFAULT_HERO_VARIANT } from "@/components/sections/HeroSection";
import type { HeroVariant } from "@/components/sections/HeroSection";
import InvitationCardPreview from "@/components/paper/InvitationCardPreview";
import EnvelopeCardPreview from "@/components/paper/EnvelopeCardPreview";
import ProgramCardPreview from "@/components/paper/ProgramCardPreview";
import DressCodeCardPreview from "@/components/paper/DressCodeCardPreview";
import TableCardPreview from "@/components/paper/TableCardPreview";
import PlaceCardPreview from "@/components/paper/PlaceCardPreview";
import { getTheme } from "@/lib/themes";
import { recommendedHeroVariantFor } from "@/lib/themes/recommendedHeroVariant";
import { previewPhotoFor, previewTargetDateFor, formatPreviewDate } from "@/lib/themes/previewMedia";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";
import styles from "./PlatformFanSection.module.css";

// Same theme + couple as HeroPhoneShowcase, on purpose: this section's whole
// point is "one style, everywhere" (weddingpost.ru's own "платформа, а не
// просто пригласительные" section), so it should visibly be the *same*
// design the visitor just saw in the hero phone, not a fresh unrelated demo.
const SHOWCASE_THEME_ID = "romantic-blush";
const SHOWCASE_NAMES: [string, string] = ["Claire", "Nathaniel"];

// No `description` on these -- this card renders quite small in the fan
// (a decorative thumbnail, not the full-size version PaperEditor shows), so
// time + title alone is what actually fits without the card's own
// overflow:hidden clipping rows off the bottom.
const SCHEDULE = [
  { time: "4:00 PM", title: "Ceremony" },
  { time: "5:00 PM", title: "Cocktail hour" },
  { time: "6:30 PM", title: "Reception" },
  { time: "9:00 PM", title: "Dancing" },
];

// 2, not more -- DressCodeCardPreview's swatch row wraps once the columns'
// widths + gaps exceed the row (see DressCodeCardPreview.module.css), which
// this card's narrow fan width hits at 3 already; 2 fits on one line and
// still reads as a palette on a card this small.
const DRESS_CODE_COLORS = [
  { hex: "#F6DCE0", label: "Blush" },
  { hex: "#C9A96E", label: "Gold" },
];

const TABLE_GUESTS = ["Emma Carter", "Jack Carter", "Olivia Bennett", "Noah Bennett", "Ava Mitchell", "Liam Mitchell"];

/** weddingpost.ru's proof for "a platform, not just an invitation": one
 * design, shown live across every physical/digital piece a couple actually
 * uses -- the site, the invitation, the envelope, the day's schedule, a
 * dress-code card, and banquet table/place cards. Every item here is a real
 * themed preview component (the same ones the paper editor and banquet
 * downloads use), not an illustration standing in for the product. */
export default function PlatformFanSection({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).landing.platformFan;
  const theme = getTheme(SHOWCASE_THEME_ID);
  const recommended = recommendedHeroVariantFor(theme.id, theme.category);
  const heroVariant: HeroVariant = HERO_VARIANTS.includes(recommended as HeroVariant)
    ? (recommended as HeroVariant)
    : DEFAULT_HERO_VARIANT;
  const photoUrl = `${previewPhotoFor(theme.id, theme.category)}?w=500&q=70&fit=crop&auto=format`;
  const targetDate = previewTargetDateFor(theme.id, theme.season);
  const dateLabel = formatPreviewDate(targetDate);
  // InvitationCardPreview/EnvelopeCardPreview format the date themselves
  // (via formatEventDate) and expect a raw YYYY-MM-DD, not the pre-formatted
  // label HeroSection takes -- passing dateLabel to them produces "Invalid
  // Date" since it re-parses an already-formatted string.
  const isoDate = targetDate.toISOString().slice(0, 10);

  return (
    <div className={styles.layout}>
      <div className={styles.text}>
        <h2 className={styles.heading}>{t.heading}</h2>
        <p className={styles.subtext}>{t.subtext}</p>
      </div>

      <div className={styles.fanWrap}>
        <div className={`${styles.item} ${styles.table}`}>
          <TableCardPreview theme={theme} tableName="Table 3" guestNames={TABLE_GUESTS} />
        </div>

        <div className={`${styles.item} ${styles.envelope}`}>
          <EnvelopeCardPreview theme={theme} names={SHOWCASE_NAMES} eventDate={isoDate} />
        </div>

        <div className={`${styles.item} ${styles.program}`}>
          <ProgramCardPreview theme={theme} events={SCHEDULE} />
        </div>

        <div className={`${styles.item} ${styles.dressCode}`}>
          <DressCodeCardPreview
            theme={theme}
            title="Dress Code"
            description="Garden formal — soft, romantic tones"
            colors={DRESS_CODE_COLORS}
          />
        </div>

        <div className={`${styles.item} ${styles.invitation}`}>
          <InvitationCardPreview theme={theme} names={SHOWCASE_NAMES} eventDate={isoDate} side="front" />
        </div>

        <div className={`${styles.item} ${styles.place}`}>
          <PlaceCardPreview theme={theme} guestName="Olivia Bennett" />
        </div>

        <div className={`${styles.item} ${styles.phone}`}>
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
    </div>
  );
}
