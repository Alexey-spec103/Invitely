import { Mail, Users, CheckCircle2, Gift } from "lucide-react";

interface InvitationStatsProps {
  invitationsSent: number;
  guestsCount: number;
  confirmedCount: number;
  giftWishesCount: number;
}

/** dashboard-audit.md B22: weddingpost.ru's own "Статистика" column --
 * icon + label + count, `0/∞` meaning "no limits" said as a number rather
 * than a claim in prose. Their fourth metric is money actually collected
 * through a real payment system ("Собрано денежных подарков") -- Invitely's
 * gift_preferences is just a wishlist with no amount field or payment
 * behind it, so that's swapped for a real count instead of a fabricated
 * currency figure: how many gift wishes the couple has actually listed.
 * "Invitations sent" and "Guests" read as two different real numbers here
 * (guests with invitation_sent_at set vs. every guest), unlike weddingpost's
 * own separate invitation/guest entities -- same underlying idea, honestly
 * mapped onto Invitely's actual data model. */
export default function InvitationStats({
  invitationsSent,
  guestsCount,
  confirmedCount,
  giftWishesCount,
}: InvitationStatsProps) {
  const rows = [
    { icon: Mail, label: "Invitations sent", value: `${invitationsSent}/∞` },
    { icon: Users, label: "Guests", value: `${guestsCount}/∞` },
    { icon: CheckCircle2, label: "Confirmed", value: String(confirmedCount) },
    { icon: Gift, label: "Gift wishes listed", value: String(giftWishesCount) },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-900">Stats</p>
      <ul className="mt-4 space-y-3">
        {rows.map(({ icon: Icon, label, value }) => (
          <li key={label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm text-gray-600">
              <Icon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
              {label}
            </span>
            <span className="text-sm font-semibold text-gray-900">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
