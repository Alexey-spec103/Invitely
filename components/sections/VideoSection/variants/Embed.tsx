import type { VideoSectionVariantProps } from "../types";
import { resolveVideoEmbed } from "../videoEmbed";
import styles from "./Embed.module.css";

export default function Embed({ title, videoUrl }: VideoSectionVariantProps) {
  const embed = resolveVideoEmbed(videoUrl);

  return (
    <section className={styles.section}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <div className={styles.frame}>
        {embed.kind === "iframe" ? (
          <iframe
            className={styles.media}
            src={embed.src}
            title={title || "Video"}
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
