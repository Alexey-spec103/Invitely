"use client";

import type { VideoSectionVariantProps } from "../types";
import { resolveVideoEmbed } from "../videoEmbed";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import { getDictionary } from "@/lib/i18n/dictionary";
import styles from "./Embed.module.css";

export default function Embed({ title, videoUrl, styleOverrides, locale }: VideoSectionVariantProps) {
  const { editable } = useEditableField();
  const t = getDictionary(locale).video;
  if (!videoUrl && !editable) {
    return null;
  }
  const embed = videoUrl ? resolveVideoEmbed(videoUrl) : null;

  return (
    <section className={styles.section}>
      {(title || editable) && (
        <h2 className={styles.title}>
          <EditableText field="title" value={title ?? ""} style={styleOverrides?.["title"]} />
        </h2>
      )}
      <div className={styles.frame}>
        <span className={styles.flourish} data-pos="tl" aria-hidden="true" />
        <span className={styles.flourish} data-pos="tr" aria-hidden="true" />
        <span className={styles.flourish} data-pos="bl" aria-hidden="true" />
        <span className={styles.flourish} data-pos="br" aria-hidden="true" />
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
    </section>
  );
}
