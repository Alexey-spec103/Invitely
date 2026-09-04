import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./MinimalText.module.css";

export default function MinimalText({
  names,
  eventDate,
  styleOverrides,
}: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
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
