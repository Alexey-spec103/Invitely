"use client";

import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import StaggerReveal from "@/components/StaggerReveal";
import { CORNER_PAIR_DECOR } from "@/lib/themes/decorMotifs";
import styles from "./WatercolorBotanical.module.css";

/** dashboard-audit.md C8: "watercolor botanical" -- a distinct technique
 * from WatercolorBloom's abstract paint-splash silhouette (which stays
 * exactly as-is; this is a new sibling, not a rewrite of it). Same soft
 * CSS-masked-SVG approach, but the shape is a real arching floral branch
 * (leaves + a couple of loose blooms) rather than an imprecise blob, so the
 * "botanical" half of the name is actually true of what renders. A second,
 * smaller eucalyptus sprig layers behind the first at an offset -- two
 * different real branch assets reading as depth, not the same shape
 * doubled. Same crop-safe "centered by the flex parent, nudged with
 * transform" technique as .branch (see that rule's own comment on why an
 * explicit top/left here would fall outside the theme gallery's crop). */
export default function WatercolorBotanical({ names, eventDate, styleOverrides, themeCategory }: HeroSectionVariantProps) {
  const { editable } = useEditableField();
  const decor = themeCategory ? CORNER_PAIR_DECOR[themeCategory] : undefined;
  return (
    <section className={styles.section}>
      {decor ? (
        <>
          <img className={styles.branchColor} src={decor[0]} alt="" aria-hidden="true" />
          <img className={styles.branchBackColor} src={decor[1]} alt="" aria-hidden="true" />
        </>
      ) : (
        <>
          <span className={styles.branchBack} aria-hidden="true" />
          <span className={styles.branch} aria-hidden="true" />
        </>
      )}
      <div className={styles.content}>
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
      </div>
    </section>
  );
}
