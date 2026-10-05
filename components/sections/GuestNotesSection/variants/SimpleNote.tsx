"use client";

import type { GuestNotesSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import { CORNER_PAIR_DECOR } from "@/lib/themes/decorMotifs";
import styles from "./SimpleNote.module.css";

/** A practical-requests block, deliberately plainer than Letter's warm
 * personal narrative -- "please arrive by 3pm," "unplugged ceremony,"
 * "kids welcome" belong here, not mixed into the couple's own voice. Same
 * title+body shape and corner-decor treatment as Gift's own SimpleList (no
 * repeatable items here, so no grid). */
export default function SimpleNote({ title, body, styleOverrides, themeCategory }: GuestNotesSectionVariantProps) {
  const { editable } = useEditableField();
  const accentAssets = themeCategory ? CORNER_PAIR_DECOR[themeCategory] : undefined;
  return (
    <section className={accentAssets ? `${styles.section} ${styles.sectionColor}` : styles.section}>
      {accentAssets && (
        <>
          <img className={styles.accentTopLeft} src={accentAssets[0]} alt="" aria-hidden="true" />
          <img className={styles.accentBottomRight} src={accentAssets[1]} alt="" aria-hidden="true" />
        </>
      )}
      {(title || editable) && (
        <h2 className={styles.title}>
          <EditableText field="title" value={title ?? ""} style={styleOverrides?.["title"]} />
        </h2>
      )}
      {(body || editable) && (
        <p className={styles.body}>
          <EditableText
            field="body"
            value={body ?? ""}
            style={styleOverrides?.["body"]}
            placeholder="Parking, dress code notes, unplugged ceremony, kids welcome…"
          />
        </p>
      )}
    </section>
  );
}
