import Link from "next/link";

// PLACEHOLDER LEGAL TEXT -- same caveat as app/terms/page.tsx: this exists
// to close the trust/GDPR gap landing-audit.md priority 16 flagged (no
// privacy policy at all, for a service that collects guest RSVP data), but
// it is generic boilerplate, NOT reviewed or drafted by a lawyer. It must be
// replaced with attorney-reviewed terms -- ideally covering the actual list
// of subprocessors (Supabase, image hosting, any payment processor) -- before
// this product takes real payments or handles real guests' data.
export const metadata = {
  title: "Privacy Policy — Invitely",
};

export default function PrivacyPage() {
  return (
    <div className="bg-white font-sans">
      <header className="border-b border-stone-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-stone-900">
            Invitely
          </Link>
          <Link href="/" className="text-sm font-medium text-stone-500 hover:text-stone-900">
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-stone-400">Last updated: September 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-stone-600">
          <section>
            <h2 className="text-base font-semibold text-stone-900">1. What we collect</h2>
            <p className="mt-2">
              When you create an account: your name and email address. When you build a site:
              the event details, photos, and text you choose to add. When guests RSVP: the
              names, responses, and any custom-question answers they submit through your site.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">2. How we use it</h2>
            <p className="mt-2">
              To operate the account and event site you create, to display your published site to
              the guests you invite, to process RSVPs, and to send account-related email (e.g.
              password resets). We don&apos;t sell your data or your guests&apos; data.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">3. Who we share it with</h2>
            <p className="mt-2">
              Service providers that host and run Invitely on our behalf (database and file
              hosting, email delivery, and — if you use a paid plan — a payment processor).
              We don&apos;t share your data with anyone else.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">4. Your rights</h2>
            <p className="mt-2">
              You can access, correct, export, or delete your account data at any time from your
              dashboard, or by contacting us. If you&apos;re in the EU/EEA, this includes the
              rights guaranteed under the GDPR.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">5. Cookies</h2>
            <p className="mt-2">
              We use essential cookies to keep you signed in and to remember your site&apos;s
              draft state. We don&apos;t use third-party advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">6. Data retention</h2>
            <p className="mt-2">
              We keep your account and site data for as long as your account is active. Deleting
              your account removes your published site and guest data, subject to any retention
              required by law (e.g. payment records).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">7. Contact</h2>
            <p className="mt-2">
              Questions about this policy, or a request to access/delete your data?{" "}
              <a href="mailto:support@invitely.app" className="text-stone-900 underline underline-offset-2">
                support@invitely.app
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
