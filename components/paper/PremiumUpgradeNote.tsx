import Link from "next/link";

interface PremiumUpgradeNoteProps {
  eventId: string;
}

/** dashboard-audit.md B21: shared caption next to a watermarked material,
 * pointing at the one real "unlock" action Invitely has -- the actual
 * /plan page, not a fake checkout (same honest link used by B20's payment
 * badges). Kept in one place so the wording can't drift between the
 * Seating, Paper, and Invitations tabs. */
export default function PremiumUpgradeNote({ eventId }: PremiumUpgradeNoteProps) {
  return (
    <p className="text-xs text-gray-500">
      🔒 Downloads with a watermark on the Free/Basic plan.{" "}
      <Link
        href={`/dashboard/${eventId}/plan`}
        className="font-medium text-[var(--dash-accent)] underline underline-offset-2"
      >
        Upgrade to Premium
      </Link>{" "}
      to remove it.
    </p>
  );
}
