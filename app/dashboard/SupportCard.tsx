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
 * the other two are swapped for things Invitely genuinely does. */
export default function SupportCard() {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center sm:p-8">
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900">✨ A few things worth knowing</p>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li>
            Everything here downloads as an <span className="font-medium text-gray-900">unlimited PDF</span> — nothing
            is locked behind a paywall while you&apos;re still deciding.
          </li>
          <li>
            Your site and RSVPs update the moment you hit save —{" "}
            <span className="font-medium text-gray-900">no waiting</span> on anyone to approve or process anything.
          </li>
          <li>Found a bug, or just have a question? Reach out — a real person reads every message.</li>
        </ul>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-2 border-t border-gray-100 pt-6 text-center sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--dash-accent)_12%,white)] text-2xl" aria-hidden="true">
          💌
        </span>
        <p className="text-xs text-gray-500">Questions? We&apos;re here.</p>
        <a
          href="mailto:support@invitely.app"
          className="text-sm font-semibold text-[var(--dash-accent)] underline underline-offset-2"
        >
          support@invitely.app
        </a>
      </div>
    </div>
  );
}
