import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./VictorianCameo.module.css";

/** Vintage: a circular photo ringed by an ornate scroll frame, evoking an
 * antique cameo locket -- the round silhouette makes this structurally
 * distinct from VintageOrnamental's rectangular double-frame and
 * PostageStamp's thick-margin rectangle. Honest fallback: no photo means no
 * empty ring, just the script names/date. */
export default function VictorianCameo({ names, eventDate, photoUrl, styleOverrides }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      {photoUrl && (
        <div className={styles.locket}>
          <span className={styles.ring} aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoUrl} alt="" className={styles.photo} />
        </div>
      )}
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
