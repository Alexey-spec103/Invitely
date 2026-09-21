import styles from "./PublicSiteBadge.module.css";

/** Free-plan growth lever: every guest of a Free-tier site sees this, and
 * every host who dislikes it has a one-click reason to upgrade (Basic+
 * removes it, same as the paper/banquet watermark). Basic-plan events never
 * render this component at all -- see app/e/[slug]/page.tsx's hasBasicAccess. */
export default function PublicSiteBadge() {
  return (
    <a href="/" className={styles.badge}>
      <span className={styles.mark} aria-hidden="true">
        ✦
      </span>
      Made with Invitely
    </a>
  );
}
