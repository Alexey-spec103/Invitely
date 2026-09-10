import Link from "next/link";
import { Sparkles, ListChecks } from "lucide-react";
import { getEventType } from "@/lib/eventTypes";

interface HubOverviewStripProps {
  eventId: string;
  eventType: string;
  themeName: string;
  weddingDataPercent: number;
  planName: string;
  planPriceEur: number;
}

/** The 3-card strip weddingpost.ru shows atop its "Приглашения"/"Банкет" hub
 * screens (style / wedding-info-completeness / balance), confirmed via
 * Chrome to be absent from "Гости" -- so this is only rendered on
 * Invitations and Banquet, not Guests. Their third card is a real payment
 * balance ("Пополнить"); we have no payment integration (deferred -- see
 * project memory), so it's replaced with the closest existing analog, the
 * event's plan tier, linking to /plan instead of a top-up flow. */
export default function HubOverviewStrip({
  eventId,
  eventType,
  themeName,
  weddingDataPercent,
  planName,
  planPriceEur,
}: HubOverviewStripProps) {
  const base = `/dashboard/${eventId}`;
  const isWedding = getEventType(eventType).id === "wedding";

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-3">
      <div className="flex flex-col rounded-2xl bg-white p-5 text-center shadow-sm">
        <p className="text-sm font-semibold text-gray-900">{isWedding ? "Wedding style" : "Event style"}</p>
        <div className="mt-4 flex flex-1 items-center justify-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--dash-accent)_12%,white)] text-[var(--dash-accent)]">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-base font-semibold text-gray-900">{themeName}</span>
        </div>
        <Link href={`${base}/style`} className="dash-btn dash-btn-secondary mt-4 justify-self-center self-center">
          Edit
        </Link>
      </div>

      <div className="flex flex-col rounded-2xl bg-white p-5 text-center shadow-sm">
        <p className="text-sm font-semibold text-gray-900">{isWedding ? "Wedding details" : "Event details"}</p>
        <div className="mt-4 flex-1">
          <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
            <ListChecks className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            {isWedding
              ? "Fill in your wedding details to complete your invitation text"
              : "Fill in your event details to complete your invitation text"}
          </p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-gray-200">
            <div
              className="h-1.5 rounded-full bg-[var(--dash-accent)]"
              style={{ width: `${weddingDataPercent}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">{weddingDataPercent}% complete</p>
        </div>
        <Link href={`${base}/site#wedding-data-card`} className="dash-btn dash-btn-secondary mt-4 self-center">
          Edit
        </Link>
      </div>

      <div className="flex flex-col rounded-2xl bg-white p-5 text-center shadow-sm">
        <p className="text-sm font-semibold text-gray-900">Your plan</p>
        <div className="mt-4 flex-1">
          <p className="text-2xl font-semibold text-gray-900">
            {planName}
            {planPriceEur > 0 && <span className="text-base font-medium text-gray-500"> · €{planPriceEur}</span>}
          </p>
        </div>
        {/* dashboard-audit.md B20: weddingpost.ru stations real Visa/
            MasterCard/PCI-DSS badges directly above its top-up button --
            we have no real payment processing behind a plan change (see
            PlanSelectForm.tsx: "Select" just sets plan_id, nothing is
            charged), so real card-network badges here would be a false
            trust claim, not a missing decoration. The honest equivalent:
            state plainly that nothing is charged, in the same
            badge-at-the-button position rather than quiet footer text. */}
        <span className="mt-3 inline-flex items-center justify-center gap-1 self-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
          🔓 No payment collected
        </span>
        <Link href={`${base}/plan`} className="dash-btn dash-btn-secondary mt-3 self-center">
          Change plan
        </Link>
      </div>
    </div>
  );
}
