import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./PhotoFullBleed.module.css";

export default function PhotoFullBleed({
  names,
  eventDate,
  photoUrl,
  styleOverrides,
}: HeroSectionVariantProps) {
  if (!photoUrl) {
    return (
      <section className={styles.sectionNoPhoto}>
        <div className={styles.contentCentered}>
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
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photoUrl} alt="" className={styles.photo} />
      <div className={styles.overlay} />
      <span className={styles.moon} aria-hidden="true" />
      <div className={styles.content}>
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
      </div>
    </section>
  );
}
