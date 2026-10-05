import styles from "./UnpublishedPreviewBanner.module.css";

/** Only ever rendered for the event's own owner -- RLS (see
 * supabase/migrations/20260811120000_owner_events_policies.sql) means no
 * anonymous guest can load this page at all while the event is unpublished
 * (they get a plain 404 instead), so app/e/[slug]/page.tsx only mounts this
 * when `event.status !== "published"`, which is only reachable by the owner
 * previewing their own draft.
 *
 * Exists because a host testing their own RSVP form before publishing got no
 * warning the submission wouldn't be saved until the error appeared after
 * clicking submit -- confirmed live via dashboard-audit critique
 * 2026-10-04 (P0: "Interactive RSVP form offered on an unpublished site,
 * failing only after full submission"). Fixed above the fold, not just near
 * RSVP, since a host might scroll straight to RSVP and never see a notice
 * placed lower on the page. */
export default function UnpublishedPreviewBanner({ message }: { message: string }) {
  return (
    <div className={styles.banner} role="status">
      {message}
    </div>
  );
}
