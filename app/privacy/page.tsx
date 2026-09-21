import Link from "next/link";

// LEGAL TEXT, STILL NOT ATTORNEY-REVIEWED -- upgraded 2026-09-21 from the
// original generic-boilerplate pilot to name this product's actual
// subprocessors and data flows (Supabase for auth/database/photo storage,
// Resend for transactional email -- confirmed against lib/photoUpload.ts and
// lib/email.ts, not guessed) and add sections a data-collecting SaaS
// typically needs (security, international transfer, children's privacy)
// that the original pilot omitted entirely. This closes the "vague
// boilerplate" gap, but a real privacy lawyer in the operating company's own
// jurisdiction must still review this before the product takes real
// payments or handles real guests' data -- an AI-drafted policy, however
// accurate about the *product*, cannot itself constitute legal compliance
// advice.
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
              We use a small number of service providers (&quot;subprocessors&quot;) to run
              Invitely, each bound by its own data protection terms:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <span className="font-medium text-stone-900">Supabase</span> — our database,
                authentication, and photo-storage provider. Your account, your site&apos;s
                content, and any photos you upload are stored here.
              </li>
              <li>
                <span className="font-medium text-stone-900">Resend</span> — our transactional
                email provider, used to send account emails (e.g. password resets) and, if you
                choose to send them, guest invitation emails.
              </li>
              <li>
                If you use a paid plan once payments launch, a payment processor will handle your
                card details directly — we never see or store full card numbers ourselves.
              </li>
            </ul>
            <p className="mt-2">We don&apos;t sell your data, or your guests&apos; data, to anyone.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">4. Your rights</h2>
            <p className="mt-2">
              You can access, correct, export, or delete your account data at any time from your
              dashboard, or by contacting us. If you&apos;re in the EU/EEA, UK, or another
              jurisdiction with similar protections, this includes the rights guaranteed under
              the GDPR (or that jurisdiction&apos;s equivalent) — including the right to lodge a
              complaint with your local data protection authority.
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
            <h2 className="text-base font-semibold text-stone-900">7. Security</h2>
            <p className="mt-2">
              We rely on our subprocessors&apos; security controls (encryption in transit and at
              rest, access controls) and apply our own access restrictions on top — for example,
              guest RSVP lookups only ever return the one guest&apos;s own name, table, and RSVP
              status, never a full guest list, and a site&apos;s content is not publicly readable
              until its host explicitly publishes it. No method of transmission or storage is
              100% secure, so we can&apos;t guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">8. International data transfers</h2>
            <p className="mt-2">
              Our subprocessors may store and process data in countries other than your own,
              including outside the EU/EEA. Where that happens, we rely on the safeguards those
              providers offer (such as standard contractual clauses) to protect your data to a
              comparable standard.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">9. Children&apos;s privacy</h2>
            <p className="mt-2">
              Invitely is intended for adults planning events, not for use by children. We don&apos;t
              knowingly collect account data from anyone under 16. A guest RSVP may include a
              minor&apos;s name if a host invites them as a plus-one, but we don&apos;t knowingly
              collect data directly from children.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">10. Changes to this policy</h2>
            <p className="mt-2">
              We may update this policy as the product changes (for example, once payments
              launch). Material changes will be reflected here with an updated date; continuing
              to use Invitely after a change means you accept the update.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-900">11. Contact</h2>
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
