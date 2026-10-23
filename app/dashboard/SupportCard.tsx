/** dashboard-audit.md B19: weddingpost.ru's own "Блок поддержки сверху" on
 * its Guests screen -- a white card with a few reassuring bullets and a
 * contact panel. Their version pairs it with a photo of a real support
 * manager and 4 contact channels (VK, reviews, WhatsApp, Telegram); we
 * deliberately don't fabricate a person or channels that don't exist here
 * (same honest-equivalent call as A10's InvitationsShowcase) -- just the one
 * real channel already used everywhere else in the app (Terms, Privacy,
 * landing, A10's own footer), and an icon instead of a face. Their third
 * bullet promises a designer will personally fix a couple's layout on
 * request -- a real human service we don't offer, so it isn't copied here;
 * the other two are swapped for things Invimbo genuinely does. */
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

export default function SupportCard({ locale = "en" }: { locale?: Locale }) {
  const t = getDictionary(locale).dashboard.guests.supportCard;
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center sm:p-8">
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900">{t.heading}</p>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li>{t.bulletPdf}</li>
          <li>{t.bulletNoAccount}</li>
          <li>{t.bulletNoWaiting}</li>
          <li>{t.bulletContact}</li>
        </ul>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-2 border-t border-gray-100 pt-6 text-center sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--dash-accent)_12%,white)] text-2xl" aria-hidden="true">
          💌
        </span>
        <p className="text-xs text-gray-600">{t.questionsCaption}</p>
        <a
          href="mailto:support@invimbo.com"
          className="text-sm font-semibold text-[var(--dash-accent-text)] underline underline-offset-2"
        >
          support@invimbo.com
        </a>
      </div>
    </div>
  );
}
