/** weddingpost.ru's proof that Invitely is a platform for managing guests,
 * not just sending a card: their own page shows a hand-drawn delivery-method
 * diagram (SMS/messenger/social icons converging on a couple of guest
 * segments) feeding into a color-coded guest table. That diagram is a drawn
 * illustration, not real UI -- so rather than redraw it, this shows two real
 * screenshots of Invitely's own product: the actual public-site share menu
 * (how a couple actually gets their link to guests) and the actual guest
 * list with its Sent/RSVP status badges (how they track who's coming) --
 * see docs/research/landing-audit.md priority 9. Channels are copy-link/
 * WhatsApp/SMS/email (SendInviteMenu in GuestManager.tsx) -- no Telegram,
 * corrected after the dashboard-audit.md D2 sweep found the screenshot and
 * copy here had drifted to a channel that was never actually built. */
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

export default function GuestTrackingSection({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).landing.guestTracking;

  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--dash-accent-text)]">
          {t.eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">{t.heading}</h2>
        <p className="mt-4 max-w-md text-stone-600">{t.subtext}</p>

        <div className="mt-8 overflow-hidden rounded-xl border border-stone-200 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/marketing/guest-share-panel.png"
            alt="Invitely's real share menu: Copy link, WhatsApp, SMS, Email"
            className="w-full"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/marketing/guest-tracking.png"
          alt="Invitely's real guest list: Sent/Not sent badges and live RSVP responses"
          className="w-full"
        />
      </div>
    </div>
  );
}
