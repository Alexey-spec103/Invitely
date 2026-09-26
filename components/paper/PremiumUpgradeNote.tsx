import Link from "next/link";

interface PremiumUpgradeNoteProps {
  eventId: string;
}

/** dashboard-audit.md B21: shared caption next to a watermarked material,
 * pointing at the one real "unlock" action Invimbo has -- the actual
 * /plan page, not a fake checkout (same honest link used by B20's payment
 * badges). Kept in one place so the wording can't drift between the
 * Seating, Paper, and Invitations tabs.
 *
 * Watermark removal moved from Premium to Basic -- printable materials are
 * the natural "I want the real thing" purchase moment, so that's the gate
 * now. */
export default function PremiumUpgradeNote({ eventId }: PremiumUpgradeNoteProps) {
  return (
    <p className="text-xs text-gray-500">
      🔒 Downloads with a watermark on the Free plan.{" "}
      <Link
        href={`/dashboard/${eventId}/plan`}
        className="font-medium text-[var(--dash-accent)] underline underline-offset-2"
      >
        Upgrade to Basic
      </Link>{" "}
      to remove it.
    </p>
  );
}
