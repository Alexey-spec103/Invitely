import type { VideoSectionVariantProps } from "../types";
import { resolveVideoEmbed } from "../videoEmbed";
import styles from "./FramedPolaroid.module.css";

export default function FramedPolaroid({ title, videoUrl }: VideoSectionVariantProps) {
  const embed = resolveVideoEmbed(videoUrl);

  return (
    <section className={styles.section}>
      <div className={styles.polaroid}>
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
        {title && <p className={styles.caption}>{title}</p>}
      </div>
    </section>
  );
}
