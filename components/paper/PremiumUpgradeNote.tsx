import Link from "next/link";
import { plans } from "@/lib/plans";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

interface PremiumUpgradeNoteProps {
  eventId: string;
  /** Optional, defaults to English -- same pattern as the canvas sub-components. */
  locale?: Locale;
}

/** dashboard-audit.md B21: shared caption next to a watermarked material,
 * pointing at the one real "unlock" action Invimbo has -- the actual
 * /plan page, not a fake checkout (same honest link used by B20's payment
 * badges). Kept in one place so the wording can't drift between the
 * Seating, Paper, and Invitations tabs.
 *
 * Watermark-free printable materials are a Premium feature -- Basic covers
 * the digital site only. */
export default function PremiumUpgradeNote({ eventId, locale }: PremiumUpgradeNoteProps) {
  const t = getDictionary(locale ?? "en").dashboard.common.upgradeNote;
  // Direct feedback: this used to be a tiny gray caption (text-xs
  // text-gray-500) sitting quietly next to the material -- easy to miss
  // entirely, which meant a host could believe a watermarked download was
  // free until they actually opened the PDF. Money-related gating needs to
  // be impossible to miss, not a footnote -- same bold/bordered treatment
  // as the Free-plan watermark preview on the Plan page.
  return (
    <div className="flex items-center gap-2 rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3">
      <span className="text-xl" aria-hidden="true">
        🔒
      </span>
      <p className="text-sm font-bold text-amber-900">
        {t.warning}{" "}
        <Link
          href={`/dashboard/${eventId}/plan`}
          className="underline decoration-2 underline-offset-2 hover:text-amber-700"
        >
          {t.upgradeLinkText(plans.premium.priceEur)}
        </Link>{" "}
        {t.removeSuffix}
      </p>
    </div>
  );
}
