"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateRsvpEmailNotifications, updateRsvpDigestEmail } from "./actions";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

interface RsvpNotificationToggleProps {
  eventId: string;
  enabled: boolean;
  digestEnabled: boolean;
  locale?: Locale;
}

/** Direct feedback: "клиент настроил как он хочет получать обновления" --
 * a host previously had no choice at all (submitRsvp emails the owner on
 * every response, unconditionally, once the RPC migration is applied).
 * Some hosts want that; others would rather just check the RSVP list above
 * whenever they feel like it. Plain native checkbox, not SectionToggleSwitch
 * -- that component reads --dash-* custom properties meant for the dark
 * constructor theme (Site/Paper); this page has always used plain Tailwind
 * grays, matching every other control already on it (e.g. GuestTableAssignments'
 * own "Unassigned only" filter checkbox). */
export default function RsvpNotificationToggle({ eventId, enabled, digestEnabled, locale = "en" }: RsvpNotificationToggleProps) {
  const t = getDictionary(locale).dashboard.guests.notifications;
  const router = useRouter();
  const [checked, setChecked] = useState(enabled);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Second, independent toggle for the daily digest (20261007130000_
  // rsvp_digest_email.sql + app/api/cron/rsvp-digest/route.ts) -- a host can
  // have either, both, or neither. Kept in the same card rather than a
  // separate component since they're two settings about the exact same
  // question ("how do I hear about RSVPs by email").
  const [digestChecked, setDigestChecked] = useState(digestEnabled);
  const [digestPending, setDigestPending] = useState(false);
  const [digestError, setDigestError] = useState<string | null>(null);

  const handleChange = async (next: boolean) => {
    setChecked(next);
    setError(null);
    setPending(true);
    try {
      const result = await updateRsvpEmailNotifications(eventId, next);
      if (!result.ok) throw new Error(result.message);
      router.refresh();
    } catch (err) {
      setChecked(!next);
      setError(err instanceof Error ? err.message : t.genericError);
    } finally {
      setPending(false);
    }
  };

  const handleDigestChange = async (next: boolean) => {
    setDigestChecked(next);
    setDigestError(null);
    setDigestPending(true);
    try {
      const result = await updateRsvpDigestEmail(eventId, next);
      if (!result.ok) throw new Error(result.message);
      router.refresh();
    } catch (err) {
      setDigestChecked(!next);
      setDigestError(err instanceof Error ? err.message : t.genericError);
    } finally {
      setDigestPending(false);
    }
  };

  return (
    <div className="mt-6 divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-semibold text-gray-900">{t.emailMeTitle}</p>
          <p className="mt-0.5 text-xs text-gray-600">
            {t.emailMeBody}
          </p>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
        <label className="mt-0.5 flex shrink-0 cursor-pointer items-center gap-2 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={checked}
            disabled={pending}
            onChange={(event) => handleChange(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
        </label>
      </div>
      <div className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-semibold text-gray-900">{t.dailyTitle}</p>
          <p className="mt-0.5 text-xs text-gray-600">
            {t.dailyBody}
          </p>
          {digestError && <p className="mt-1 text-xs text-red-600">{digestError}</p>}
        </div>
        <label className="mt-0.5 flex shrink-0 cursor-pointer items-center gap-2 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={digestChecked}
            disabled={digestPending}
            onChange={(event) => handleDigestChange(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
        </label>
      </div>
    </div>
  );
}
