import Link from "next/link";
import { plans } from "@/lib/plans";

interface BasicUpgradeNoteProps {
  eventId: string;
}

/** Direct feedback: a host on Free could toggle Countdown/Gift/Dress Code
 * on, fill in real content (colors, gift links, ...) in the dashboard
 * preview -- which always renders every section regardless of plan, same
 * "try everything free" policy as the rest of the constructor -- and then
 * find the whole section simply absent from their real guest-facing link,
 * with nothing at the point of editing explaining why. The Modules list
 * (SectionModulesPanel) has a small "🔒 Basic" badge, but that's easy to
 * miss once a host has scrolled down into actually editing the section.
 * Same bold/bordered treatment as PremiumUpgradeNote (components/paper),
 * this is its Basic-tier counterpart for site modules instead of paper
 * materials -- see lib/plans.ts's BASIC_GATED_SECTION_TYPES. */
export default function BasicUpgradeNote({ eventId }: BasicUpgradeNoteProps) {
  return (
    <div className="mb-3 flex items-center gap-2 rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3">
      <span className="text-xl" aria-hidden="true">
        🔒
      </span>
      <p className="text-sm font-bold text-amber-900">
        This is a paid feature — guests won&rsquo;t see this section until you&rsquo;re on Basic.{" "}
        <Link
          href={`/dashboard/${eventId}/plan`}
          className="underline decoration-2 underline-offset-2 hover:text-amber-700"
        >
          Get your link (€{plans.basic.priceEur})
        </Link>
      </p>
    </div>
  );
}
