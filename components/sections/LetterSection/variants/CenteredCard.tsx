"use client";

import type { LetterSectionVariantProps } from "../types";
import type { Locale } from "@/lib/i18n/locales";
import { LOCALE_TO_BCP47 } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/dictionary";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import { CORNER_PAIR_DECOR, CATEGORY_MASK_ACCENT } from "@/lib/themes/decorMotifs";
import styles from "./CenteredCard.module.css";

function formatDeadline(isoDate: string, locale: Locale) {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString(LOCALE_TO_BCP47[locale], { year: "numeric", month: "long", day: "numeric" });
}

/** A guest visiting after the stated deadline (very ordinary once RSVPs
 * have started coming in) shouldn't see a stale "please confirm by <past
 * date>" instruction -- once the day itself has passed, drop the line
 * rather than leave it looking broken. Server-rendered per request, so
 * comparing against `new Date()` here is safe (no client/server mismatch --
 * this component never re-renders client-side). */
function isDeadlineUpcoming(isoDate: string): boolean {
  const deadline = new Date(`${isoDate}T23:59:59`);
  return deadline.getTime() >= Date.now();
}

export default function CenteredCard({
  title,
  body,
  quote,
  note,
  rsvpDeadline,
  closingLine,
  styleOverrides,
  themeCategory,
  locale,
}: LetterSectionVariantProps) {
  const t = getDictionary(locale).letter;
  // note/closingLine below stay mounted whenever the dashboard editor is
  // active, even with nothing typed yet -- otherwise a host has no element
  // to click on to write a first one at all (confirmed live: with `editable`
  // false they simply never rendered). The public site keeps the original
  // "only if there's real text" behavior via `note && ...`.
  const { editable } = useEditableField();
  // Same category -> asset pairing as GiftSection/SimpleList's corner
  // accents (both read from CORNER_PAIR_DECOR), so every twin-corner spot
  // across the site reads as the same design system. Unmatched categories
  // keep the original theme-accent-tinted mask (safe for any palette).
  const flourishAssets = themeCategory ? CORNER_PAIR_DECOR[themeCategory] : undefined;
  // Categories with no full-color CORNER_PAIR_DECOR entry (currently
  // modern/minimal only) get their own hand-authored mask accent instead of
  // the fully generic corner-flourish fallback -- see decorMotifs.ts's own
  // comment. Reused for both corners (rotated 180deg for the second, same
  // as the plain corner-flourish fallback already does) rather than a
  // second distinct asset, matching how restrained these two categories'
  // own decor is everywhere else in the site.
  const maskAccent = !flourishAssets && themeCategory ? CATEGORY_MASK_ACCENT[themeCategory] : undefined;
  const maskAccentStyle = maskAccent
    ? { maskImage: `url(${maskAccent})`, WebkitMaskImage: `url(${maskAccent})` }
    : undefined;
  return (
    <section className={styles.section}>
      <div className={styles.card}>
        {flourishAssets ? (
          <>
            <img className={styles.flourishTopLeftColor} src={flourishAssets[0]} alt="" aria-hidden="true" />
            <img className={styles.flourishBottomRightColor} src={flourishAssets[1]} alt="" aria-hidden="true" />
          </>
        ) : (
          <>
            <span className={styles.flourishTopLeft} style={maskAccentStyle} aria-hidden="true" />
            <span className={styles.flourishBottomRight} style={maskAccentStyle} aria-hidden="true" />
          </>
        )}
        <h2 className={styles.title}>
          <EditableText
            field="title"
            value={title}
            style={styleOverrides?.["title"]}
            placeholder="Write a title for your letter…"
          />
        </h2>
        <p className={styles.body}>
          <EditableText
            field="body"
            value={body}
            style={styleOverrides?.["body"]}
            placeholder="Write a welcome message to your guests…"
          />
        </p>
        <p className={styles.quote}>
          {/* dashboard-audit.md finding #4: the decorative « » marks used to
              wrap this field unconditionally, so an empty quote read as a
              broken bare "«»" with nothing inside -- shown only once there's
              real text, while EditableText itself always stays mounted (not
              wrapped in `{quote && ...}` the way note/closingLine below are)
              so a host can still click into this field in the dashboard
              editor to write a first quote at all. */}
          {quote && "«"}
          <EditableText
            field="quote"
            value={quote}
            style={styleOverrides?.["quote"]}
            placeholder="Add a quote (optional)…"
          />
          {quote && "»"}
        </p>
        {(note || editable) && (
          <p className={styles.note}>
            <EditableText
              field="note"
              value={note ?? ""}
              style={styleOverrides?.["note"]}
              placeholder="A short extra note (optional)…"
            />
          </p>
        )}
        {/* Derived display text, not a raw content field -- not independently editable. */}
        {rsvpDeadline && isDeadlineUpcoming(rsvpDeadline) && (
          <p className={styles.deadline}>{t.confirmBy(formatDeadline(rsvpDeadline, locale))}</p>
        )}
        {(closingLine || editable) && (
          <p className={styles.closingLine}>
            <EditableText
              field="closingLine"
              value={closingLine ?? ""}
              style={styleOverrides?.["closingLine"]}
              placeholder="Sign off — e.g. “With love, the two of us”…"
            />
          </p>
        )}
      </div>
    </section>
  );
}
