import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./MonogramCrest.module.css";

function getInitials(names: string[]): string {
  return names
    .map((name) => name.trim().charAt(0))
    .join("")
    .toUpperCase();
}

/** Monogram crest: a solid shield/seal shape (CSS clip-path), not an
 * outlined circle -- the initials read as a wax-seal emblem and are the
 * dominant visual element, names/date reduced to a caption underneath. */
export default function MonogramCrest({
  names,
  eventDate,
  monogramInitials,
  styleOverrides,
}: HeroSectionVariantProps) {
  const initials = monogramInitials?.trim() || getInitials(names);

  return (
    <section className={styles.section}>
      <div className={styles.seal} aria-hidden="true">
        <span className={styles.initials}>{initials}</span>
      </div>
      <span className={styles.laurel} aria-hidden="true" />
      <p className={styles.names}>
        <EditableText field="names.0" value={names[0] ?? ""} style={styleOverrides?.["names.0"]} />
        {names[1] && (
          <>
            {" & "}
            <EditableText field="names.1" value={names[1]} style={styleOverrides?.["names.1"]} />
          </>
        )}
      </p>
      <p className={styles.date}>{eventDate}</p>
    </section>
  );
}
