import Link from "next/link";
import {
  Sparkles,
  Mail,
  Clock,
  MapPin,
  ClipboardCheck,
  Timer,
  Printer,
  Users2,
  Palette,
  Globe,
  Wand2,
  MessagesSquare,
  Video,
  Type,
  Pencil,
  Sliders,
  Heart,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { themes } from "@/lib/themes";
import { CANVAS_FONTS } from "@/lib/canvas/fonts";
import { plans } from "@/lib/plans";
import LandingThemeShowcase from "@/components/marketing/LandingThemeShowcase";
import ConstructorScreenshot from "@/components/marketing/ConstructorScreenshot";
import HeroPhoneShowcase from "@/components/marketing/HeroPhoneShowcase";
import PlatformFanSection from "@/components/marketing/PlatformFanSection";
import HowItWorksSection from "@/components/marketing/HowItWorksSection";
import GuestTrackingSection from "@/components/marketing/GuestTrackingSection";
import SiteOrPaperSection from "@/components/marketing/SiteOrPaperSection";

const themeCount = Object.keys(themes).length;
const fontCount = CANVAS_FONTS.length;

const heroChecklist = [
  { icon: Palette, text: `${themeCount} designer themes — or build your own from a blank canvas` },
  { icon: Wand2, text: `Drag anything, ${fontCount}+ fonts, any color you like` },
  { icon: ClipboardCheck, text: "RSVP tracking with your own custom questions" },
  { icon: Printer, text: "Personalized paper invitations with QR codes" },
];

const statBar = [
  { value: `${themeCount}`, label: "designer themes" },
  { value: `${fontCount}+`, label: "fonts in the constructor" },
  { value: "12", label: "site modules" },
  { value: "1", label: "link for everything" },
];

const constructorFeatures = [
  {
    icon: Type,
    title: `${fontCount}+ curated fonts`,
    description: "Script, serif, bold, or thin — swap the whole look with one click.",
  },
  {
    icon: Palette,
    title: "Any color you like",
    description: "Build your own palette to match your exact wedding colors.",
  },
  {
    icon: Wand2,
    title: "Designer-curated variations",
    description: "Or start from color and pattern combinations, hand-picked by our designers.",
  },
  {
    icon: Pencil,
    title: "Flexible text, anywhere",
    description: "Edit, resize, add, and move any text on your chosen design.",
  },
  {
    icon: Printer,
    title: "Paper add-ons & banquet cards",
    description: "Design the front and back of your invitation, plus matching banquet cards.",
  },
  {
    icon: Sliders,
    title: "Toggle site modules on and off",
    description: "Turn the countdown, schedule, RSVP, map, and more on or off, per site.",
  },
];

const modules = [
  { icon: Wand2, title: "Drag-and-drop constructor", description: "Move any text or photo, pick any font or color, and undo/redo as you go." },
  { icon: Sparkles, title: "Hero intro", description: "Your names, event date, and photo — several layouts to choose from." },
  { icon: Mail, title: "Letter to your guests", description: "A personal note, gift wishes, and RSVP deadline in one card." },
  { icon: Clock, title: "Event schedule", description: "Lay out the day, minute by minute — from the first toast to the last dance." },
  { icon: MapPin, title: "Venue & map", description: "Show guests exactly where to go, with an interactive map." },
  { icon: ClipboardCheck, title: "RSVP with custom questions", description: "Ask about meals, drinks, or transport — guests confirm online, straight to your list." },
  { icon: Timer, title: "Countdown timer", description: "Build anticipation with a live countdown to the big day." },
  { icon: MessagesSquare, title: "Guestbook wall", description: "Well-wishes guests leave at RSVP, shown as a public wall on your site." },
  { icon: Video, title: "Video", description: "Embed a YouTube or Vimeo video — your proposal, your story, your choice." },
  { icon: Printer, title: "Paper invitations", description: "Print-ready PDF invites, envelopes, and program cards, personalized per guest with a QR code." },
  { icon: Users2, title: "Banquet seating", description: "Assign tables — by name, not just headcount — and generate table & place cards to print." },
  { icon: Globe, title: "Custom domain", description: "Point your own domain at your site, or keep the readable link we give you free." },
];

// Factual, not promotional -- the free tier really is unlimited to use, and
// paper invitations are the one thing only Premium unlocks. No fabricated
// "-20%"-style discount badges: unlike weddingpost.ru's pricing section,
// nothing here is ever actually discounted, so a strikethrough price would
// be a fake one.
const planBadges: Record<string, string> = {
  free: "Always free",
  premium: "Includes paper invitations",
};

// Each paid tier's own `features` array starts with "Everything in ..." for
// the /dashboard/[eventId]/plan page's cumulative comparison -- on the
// landing page that reads as the generic "SaaS grid" the audit flagged, so
// this shows only what a tier newly adds. Derived from the same `plans`
// data (not a second copy) so it can't drift out of sync.
const planHighlights: Record<string, string[]> = Object.fromEntries(
  Object.values(plans).map((plan) => [plan.id, plan.features.filter((feature) => !feature.startsWith("Everything in"))])
);

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ctaHref = user ? "/dashboard" : "/onboarding";
  // One primary-button style everywhere (see globals.css's shared
  // --dash-accent), but a distinct verb-led label per section for a
  // logged-out visitor -- matches weddingpost.ru's own pattern of a
  // different imperative per section instead of the same generic label
  // repeated. A returning logged-in user always sees "Go to dashboard"
  // instead -- accurate for them, and not the target of this pass (that's
  // a separate header/logo rework, not done yet).
  const ctaLabel = user ? "Go to dashboard" : "Create your invitations";
  const constructorCtaLabel = user ? "Go to dashboard" : "Start building";
  const finalCtaLabel = user ? "Go to dashboard" : "Create your website";

  const showcaseThemes = Object.values(themes);

  return (
    <div className="bg-white font-sans">
      {/* landing-audit.md priority 19: weddingpost.ru's own site opens with a
          gradient bar above the header, on every screen, pre-empting the
          "can I even pay from here" objection before the visitor reaches the
          hero. Same lilac-to-pink pair as the "with a wow effect" accent
          (priority 18) -- one recognizable decorative accent reused in the
          two spots that call for it, not a third color. Sticky together with
          the header (one shared sticky wrapper) so it stays pinned exactly
          like the original while scrolling, instead of scrolling away. */}
      <div className="sticky top-0 z-40">
        <div className="bg-gradient-to-r from-violet-300 to-pink-300 py-2 text-center text-xs font-medium text-white sm:text-sm">
          Visa / Mastercard / PayPal accepted · Instant delivery — send your invite link anywhere
          in the world
        </div>
        <header className="border-b border-stone-100 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            {/* landing-audit.md priority 20: a bare wordmark gives no
                "wedding" signal and doesn't stick in memory. weddingpost.ru's
                own mark is a two-tone split heart -- their specific authored
                execution of it, not an industry-standard shape, so this is a
                solid-color heart in our one brand accent instead of a copy
                of theirs. */}
            <Link href="/" className="flex items-center gap-1.5 text-lg font-semibold tracking-tight text-stone-900">
              <Heart className="h-5 w-5 text-[var(--dash-accent)]" fill="currentColor" strokeWidth={0} />
              Invitely
            </Link>
            <nav className="hidden items-center gap-8 text-sm font-medium text-stone-600 sm:flex">
              <a href="#constructor" className="hover:text-stone-900">
                Constructor
              </a>
              <a href="#themes" className="hover:text-stone-900">
                Themes
              </a>
              <a href="#whats-included" className="hover:text-stone-900">
                What&apos;s included
              </a>
              <a href="#pricing" className="hover:text-stone-900">
                Pricing
              </a>
            </nav>
            <div className="flex items-center gap-4">
              {!user && (
                <Link href="/login" className="text-sm font-medium text-stone-600 hover:text-stone-900">
                  Login
                </Link>
              )}
              <Link
                href={ctaHref}
                className="rounded-full bg-gradient-to-r from-[var(--dash-accent)] to-red-600 px-5 py-2 text-sm font-extrabold uppercase tracking-wide text-white shadow-sm transition hover:from-[var(--dash-accent-hover)] hover:to-red-700"
              >
                {ctaLabel}
              </Link>
            </div>
          </div>
        </header>
      </div>

      <section className="overflow-hidden bg-gradient-to-b from-orange-50 via-orange-50 to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 sm:py-20 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--dash-accent-text)]">
              An event platform, not just an invitation
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
              Your event, styled exactly how you imagined it
            </h1>
            {/* landing-audit.md priority 18: the one deliberately "fancy"
                element on the screen, matching weddingpost.ru's own pink→
                purple→blue script accent -- a narrow, scoped exception to
                the single-CTA-color cleanup above (this is decorative text,
                not a button/interactive element). */}
            <p
              className="mt-2 inline-block bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-4xl text-transparent"
              style={{ fontFamily: "var(--font-alex-brush), cursive" }}
            >
              with a wow effect
            </p>
            <p className="mt-6 max-w-md text-lg text-stone-600">
              A beautiful event website, matching paper invitations, and guest seating — one
              style, everywhere your guests see it. Start from a designer theme, or drag your own
              together from a blank canvas.
            </p>
            <ul className="mt-8 space-y-3">
              {heroChecklist.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-stone-700">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-orange-50 text-[var(--dash-accent-text)]">
                    <Icon className="h-4 w-4" strokeWidth={2.25} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href={ctaHref}
                className="inline-block rounded-full bg-gradient-to-r from-[var(--dash-accent)] to-red-600 px-8 py-3.5 text-base font-extrabold uppercase tracking-wide text-white shadow-md transition hover:from-[var(--dash-accent-hover)] hover:to-red-700"
              >
                {ctaLabel}
              </Link>
              <a
                href="#constructor"
                className="text-sm font-bold uppercase tracking-wide text-[var(--dash-accent-text)] hover:text-red-700"
              >
                See the constructor →
              </a>
            </div>
          </div>

          <HeroPhoneShowcase />
        </div>

        <div className="border-t border-orange-100/80 bg-white/60">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-6 py-8 sm:grid-cols-4">
            {statBar.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-semibold text-stone-900 sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs text-stone-500 sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-stone-100 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <PlatformFanSection />
        </div>
      </section>

      <section id="constructor" className="py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--dash-accent-text)]">
              The real constructor
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">
              Not just a theme picker — a canvas
            </h2>
            <p className="mt-4 max-w-md text-stone-600">
              Pick a designer theme to start fast, then move anything: drag text and photos
              anywhere on the page, pick from {fontCount}+ fonts, choose any color, layer
              elements front to back, and undo your way back if you change your mind. The exact
              design you build carries over to your printed invitations too.
            </p>
            <div className="mt-8">
              <Link
                href={ctaHref}
                className="inline-block rounded-full bg-gradient-to-r from-[var(--dash-accent)] to-red-600 px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition hover:from-[var(--dash-accent-hover)] hover:to-red-700"
              >
                {constructorCtaLabel}
              </Link>
            </div>
          </div>
          <ConstructorScreenshot />
        </div>

        <div className="mx-auto mt-20 grid max-w-6xl gap-8 px-6 sm:grid-cols-2">
          {constructorFeatures.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-orange-50 text-[var(--dash-accent-text)]">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <div>
                <h3 className="text-base font-semibold text-stone-900">{title}</h3>
                <p className="mt-1 text-sm text-stone-600">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <HowItWorksSection ctaHref={ctaHref} ctaLabel={constructorCtaLabel} />

      <section className="border-t border-stone-100 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SiteOrPaperSection />
        </div>
      </section>

      <section id="themes" className="border-t border-stone-100 bg-stone-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-stone-900">
            Choose your style
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-stone-600">
            The same theme carries through your site, paper invitations, and banquet cards — or
            skip it entirely and design from scratch in the constructor.
          </p>
          <div className="mt-16">
            <LandingThemeShowcase themes={showcaseThemes} />
          </div>
        </div>
      </section>

      <section id="whats-included" className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-stone-900">
            What&apos;s included
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-stone-600">
            Every site comes with these building blocks — mix and match to tell your story.
          </p>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-xl border border-stone-200 bg-white p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-[var(--dash-accent-text)]">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <h3 className="mt-4 text-base font-semibold text-stone-900">{title}</h3>
                <p className="mt-2 text-sm text-stone-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-stone-100 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <GuestTrackingSection />
        </div>
      </section>

      <section id="pricing" className="border-t border-stone-100 bg-stone-50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-stone-900">
            The constructor is always free
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-stone-600">
            Design your site, invite guests, and track RSVPs at no cost. Pay only when you want a
            custom domain, paper invitations, or banquet seating.
          </p>
          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {Object.values(plans).map((plan) => (
              <div key={plan.id} className="relative rounded-xl border border-stone-200 bg-white p-6">
                {planBadges[plan.id] && (
                  <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-[var(--dash-accent)] to-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                    {planBadges[plan.id]}
                  </span>
                )}
                <p className="text-sm font-semibold text-stone-900">{plan.name}</p>
                <p className="mt-2 text-3xl font-semibold text-stone-900">
                  {plan.priceEur === 0 ? "Free" : `€${plan.priceEur}`}
                </p>
                <p className="mt-2 text-xs uppercase tracking-wide text-stone-400">
                  {plan.id === "free" ? "What you get" : "What this adds"}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-stone-600">
                  {planHighlights[plan.id].map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-stone-100 bg-gradient-to-b from-white to-orange-50 py-24 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-stone-900">Free to start</h2>
          <p className="mt-4 text-lg text-stone-600">
            No credit card required. Create your site and publish it whenever you&apos;re ready.
          </p>
          <div className="mt-8">
            <Link
              href={ctaHref}
              className="inline-block rounded-full bg-gradient-to-r from-[var(--dash-accent)] to-red-600 px-8 py-3 text-base font-extrabold uppercase tracking-wide text-white shadow-md transition hover:from-[var(--dash-accent-hover)] hover:to-red-700"
            >
              {finalCtaLabel}
            </Link>
          </div>
        </div>
      </section>

      {/* landing-audit.md priority 16/9: dark footer with real contact info,
          payment trust badges, and terms/privacy links -- the audit's
          concrete complaint was that a visitor about to pay hits a footer
          with no address, phone, or legal docs at all. We adapt rather than
          copy: weddingpost.ru's footer lists real RU business-registration
          numbers (ИНН/ОГРН/ОКВЭД) for their actual legal entity, which we
          don't have (no registered company behind this project) -- inventing
          fake registration numbers would be worse than having none, so this
          keeps only what's real (a support address) plus the payment badges
          and legal-doc links the audit's own "what to do" asks for. bg-stone-900
          reuses the one dark accent already used elsewhere (error/not-found
          pages) instead of introducing a new color. */}
      <footer className="bg-stone-900 py-16 text-stone-300">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <p className="flex items-center gap-1.5 text-lg font-semibold tracking-tight text-white">
                <Heart className="h-5 w-5 text-[var(--dash-accent)]" fill="currentColor" strokeWidth={0} />
                Invitely
              </p>
              <p className="mt-2 text-sm text-stone-400">Event websites, live in minutes.</p>
              <div className="mt-6 flex items-center gap-3 text-xs font-semibold tracking-wide text-stone-400">
                <span className="rounded border border-stone-700 px-2 py-1">VISA</span>
                <span className="rounded border border-stone-700 px-2 py-1">MASTERCARD</span>
                <span className="rounded border border-stone-700 px-2 py-1">PAYPAL</span>
              </div>
              <p className="mt-2 text-xs text-stone-500">Visa / Mastercard / PayPal accepted</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Product</p>
              <ul className="mt-3 space-y-2 text-sm text-stone-400">
                <li>
                  <a href="#constructor" className="hover:text-white">
                    Constructor
                  </a>
                </li>
                <li>
                  <a href="#themes" className="hover:text-white">
                    Themes
                  </a>
                </li>
                <li>
                  <a href="#whats-included" className="hover:text-white">
                    What&apos;s included
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Legal & account</p>
              <ul className="mt-3 space-y-2 text-sm text-stone-400">
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy policy
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-white">
                    Sign up
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-2 border-t border-stone-800 pt-6 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Invitely. All rights reserved.</p>
            <a href="mailto:support@invitely.app" className="hover:text-stone-300">
              support@invitely.app
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
