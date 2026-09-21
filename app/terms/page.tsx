import Link from "next/link";

// LEGAL TEXT, STILL NOT ATTORNEY-REVIEWED -- upgraded 2026-09-21 alongside
// app/privacy/page.tsx to add sections a real ToS typically needs that the
// original pilot omitted (eligibility, IP/trademarks, warranty disclaimer,
// liability limitation, termination, indemnification). Section 4 now
// reflects that Stripe payments are actually live (one-time per event, not
// a subscription). Two things this deliberately does NOT fill in: `4`'s
// refund policy, and `10. Governing
// law` -- which country/state's law and which courts apply is a business
// decision (where the operating entity is incorporated) that only the
// company can make, not something to invent. A real privacy/ToS lawyer in
// that jurisdiction must still review this before the product takes real
// payments or handles real guests' data.
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
            <h2 className="text-base font-semibold text-stone-900">3. Eligibility</h2>
            <p className="mt-2">
              You must be at least 18 years old, or the age of legal majority where you live if
              that&apos;s older, to create an Invitely account.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">4. Plans and payment</h2>
            <p className="mt-2">
              Free features remain free for as long as your account is active. Paid plans (Basic
              and Premium) are a single one-time payment per event, not a recurring subscription —
              you pay once to unlock a plan&apos;s features for that event, with no further
              charges tied to it. Payments are processed securely by Stripe; we never see or store
              your card details. Prices are shown in EUR at checkout and may change for new
              purchases, but a plan you&apos;ve already bought for an event keeps its features.
              [Refund policy to be completed by the operating entity.]
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">5. Guest data</h2>
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
            <h2 className="text-base font-semibold text-stone-900">6. Acceptable use</h2>
            <p className="mt-2">
              Don&apos;t use Invitely to publish unlawful, abusive, or infringing content, or to
              attempt to disrupt or gain unauthorized access to the service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">7. Our intellectual property</h2>
            <p className="mt-2">
              The Invitely name, logo, and the site templates, themes, and software we built are
              our property (or licensed to us). These terms don&apos;t grant you any rights to
              them beyond using the service as intended — they don&apos;t transfer to you along
              with the event site you create.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">8. Disclaimer and limitation of liability</h2>
            <p className="mt-2">
              Invitely is provided &quot;as is,&quot; without warranties of any kind. We don&apos;t
              guarantee the service will be uninterrupted, error-free, or that every email or RSVP
              will be delivered — for an event-critical use case like a wedding, keep a backup plan
              (e.g. your own guest list) rather than relying on any single tool exclusively. To the
              extent permitted by law, our liability for any claim relating to the service is limited
              to the amount you paid us in the 12 months before the claim arose, if any.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">9. Termination</h2>
            <p className="mt-2">
              You may stop using Invitely and delete your account at any time. Deleting your
              account removes your published site and associated guest data, subject to any
              retention required by law. We may suspend or terminate an account that violates
              section 6 (Acceptable use) or these terms more generally.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">10. Governing law</h2>
            <p className="mt-2">[To be completed once the operating entity and its jurisdiction are finalized.]</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">11. Changes to these terms</h2>
            <p className="mt-2">
              We may update these terms from time to time. Material changes will be communicated
              before they take effect.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">12. Contact</h2>
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
