import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./Signature.module.css";

export default function Signature({ names, eventDate, styleOverrides }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <span className={styles.sprig} aria-hidden="true" />
      <span className={styles.rule} aria-hidden="true" />
      <p className={styles.names}>
        <EditableText field="names.0" value={names[0] ?? ""} style={styleOverrides?.["names.0"]} />
        {names[1] && (
          <>
            {" & "}
            <EditableText field="names.1" value={names[1]} style={styleOverrides?.["names.1"]} />
          </>
        )}
      </p>
      <span className={styles.rule} aria-hidden="true" />
      <p className={styles.date}>{eventDate}</p>
    </section>
  );
}
