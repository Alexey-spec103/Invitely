import Link from "next/link";

// PLACEHOLDER LEGAL TEXT -- landing-audit.md priority 16 flagged that the
// footer linked nowhere for "terms of service," which is both a trust gap
// and (per the audit's own note) a GDPR-adjacent problem once real payments
// are involved. This is generic SaaS boilerplate written to fill that gap
// so the footer link isn't dead, NOT reviewed or drafted by a lawyer. It
// must be replaced with attorney-reviewed terms before this product takes
// real payments from real users.
export const metadata = {
  title: "Terms of Service — Invitely",
};

export default function TermsPage() {
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
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-stone-400">Last updated: September 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-stone-600">
          <section>
            <h2 className="text-base font-semibold text-stone-900">1. Using Invitely</h2>
            <p className="mt-2">
              Invitely lets you build and publish an event website, generate paper invitations, and
              manage guest RSVPs. By creating an account or publishing a site, you agree to these
              terms. If you don&apos;t agree, please don&apos;t use the service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">2. Your account and content</h2>
            <p className="mt-2">
              You&apos;re responsible for the accuracy of the event details, photos, and guest
              information you upload, and for keeping your login credentials secure. You retain
              ownership of the content you create; you grant Invitely the license needed to host and
              display it as part of the service you&apos;ve requested (e.g. your published event
              site).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">3. Plans and payment</h2>
            <p className="mt-2">
              Free features remain free for as long as your account is active. Paid features (custom
              domains, paper invitations, banquet tools) are billed as described at the time of
              purchase. Prices are shown in EUR and include applicable taxes unless stated otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">4. Guest data</h2>
            <p className="mt-2">
              When you invite guests and collect RSVPs, you act as the data controller for that
              guest information, and Invitely acts as a processor on your behalf. See our{" "}
              <Link href="/privacy" className="text-stone-900 underline underline-offset-2">
                Privacy Policy
              </Link>{" "}
              for how we handle data.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">5. Acceptable use</h2>
            <p className="mt-2">
              Don&apos;t use Invitely to publish unlawful, abusive, or infringing content, or to
              attempt to disrupt or gain unauthorized access to the service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">6. Cancellation</h2>
            <p className="mt-2">
              You may stop using Invitely and delete your account at any time. Deleting your account
              removes your published site and associated guest data, subject to any retention
              required by law.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">7. Changes to these terms</h2>
            <p className="mt-2">
              We may update these terms from time to time. Material changes will be communicated
              before they take effect.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">8. Contact</h2>
            <p className="mt-2">
              Questions about these terms?{" "}
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
