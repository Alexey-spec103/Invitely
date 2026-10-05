"use client";

import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import StaggerReveal from "@/components/StaggerReveal";
import EditablePhoto from "../EditablePhoto";
import styles from "./VictorianCameo.module.css";

/** Vintage: a circular photo ringed by an ornate scroll frame, evoking an
 * antique cameo locket -- the round silhouette makes this structurally
 * distinct from VintageOrnamental's rectangular double-frame and
 * PostageStamp's thick-margin rectangle. Honest fallback: no photo means no
 * empty ring, just the script names/date. */
export default function VictorianCameo({ names, eventDate, photoUrl, styleOverrides }: HeroSectionVariantProps) {
  const { editable } = useEditableField();
  return (
    <section className={styles.section}>
      {photoUrl && (
        <div className={styles.locket}>
          <span className={styles.ring} aria-hidden="true" />
          <EditablePhoto src={photoUrl} className={styles.photo} />
        </div>
      )}
      {editable ? (
        <p className={styles.names}>
          <EditableText field="names.0" value={names[0] ?? ""} style={styleOverrides?.["names.0"]} />
          {names[1] && (
            <>
              {" & "}
              <EditableText field="names.1" value={names[1]} style={styleOverrides?.["names.1"]} />
            </>
          )}
        </p>
      ) : (
        <StaggerReveal as="p" itemAs="span" className={styles.names} staggerDelay={0.12}>
          <EditableText field="names.0" value={names[0] ?? ""} style={styleOverrides?.["names.0"]} />
          {names[1] && <span>{" & "}</span>}
          {names[1] && <EditableText field="names.1" value={names[1]} style={styleOverrides?.["names.1"]} />}
        </StaggerReveal>
      )}
      <p className={styles.date}>{eventDate}</p>
    </section>
  );
}
