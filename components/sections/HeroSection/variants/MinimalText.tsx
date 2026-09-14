import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./MinimalText.module.css";

// Same local derivation as MonogramCenter/MonogramCrest -- see those files'
// own comment for why this stays a small per-file copy rather than a shared
// helper.
function getInitials(names: string[]): string {
  return names
    .map((name) => name.trim().charAt(0))
    .filter(Boolean)
    .join("")
    .toUpperCase();
}

export default function MinimalText({
  names,
  eventDate,
  styleOverrides,
}: HeroSectionVariantProps) {
  const initials = getInitials(names);
  return (
    <section className={styles.section}>
      {/* Oversized, near-transparent initials behind the content -- one
          quiet typographic flourish (no image/SVG asset) so this variant's
          large stretch of empty space reads as a deliberate composition
          instead of "nothing here yet". Auto-derived from names, not
          independently editable, same convention as MonogramCenter's own
          monogram. */}
      {initials && (
        <span className={styles.monogram} aria-hidden="true">
          {initials}
        </span>
      )}
      <p className={styles.names}>
        <EditableText field="names.0" value={names[0] ?? ""} style={styleOverrides?.["names.0"]} />
        {names[1] && (
          <>
            <span className={styles.divider} aria-hidden="true" />
            <EditableText field="names.1" value={names[1]} style={styleOverrides?.["names.1"]} />
          </>
        )}
      </p>
      <p className={styles.date}>{eventDate}</p>
    </section>
  );
}
