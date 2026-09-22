"use client";

import type { VideoSectionVariantProps } from "../types";
import { resolveVideoEmbed } from "../videoEmbed";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import { getDictionary } from "@/lib/i18n/dictionary";
import styles from "./FramedPolaroid.module.css";

export default function FramedPolaroid({ title, videoUrl, styleOverrides, locale }: VideoSectionVariantProps) {
  const { editable } = useEditableField();
  const t = getDictionary(locale).video;
  if (!videoUrl && !editable) {
    return null;
  }
  const embed = videoUrl ? resolveVideoEmbed(videoUrl) : null;

  return (
    <section className={styles.section}>
      <div className={styles.polaroid}>
        <span className={styles.tape} aria-hidden="true" />
        <div className={styles.frame}>
          {!embed ? (
            <p className={styles.placeholder}>Paste a video URL below.</p>
          ) : embed.kind === "iframe" ? (
            <iframe
              className={styles.media}
              src={embed.src}
              title={title || t.iframeTitleFallback}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video className={styles.media} src={embed.src} controls />
          )}
        </div>
        {(title || editable) && (
          <p className={styles.caption}>
            <EditableText field="title" value={title ?? ""} style={styleOverrides?.["title"]} />
          </p>
        )}
      </div>
    </section>
  );
}
