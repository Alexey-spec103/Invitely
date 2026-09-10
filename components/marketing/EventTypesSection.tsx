import Link from "next/link";
import {
  Heart,
  Sparkles,
  Gem,
  Cake,
  Baby,
  PartyPopper,
  Crown,
  GraduationCap,
  Building2,
  Award,
  CalendarHeart,
  type LucideIcon,
} from "lucide-react";

interface EventTypeShowcaseItem {
  icon: LucideIcon;
  label: string;
  blurb: string;
  tint: string;
}

// Same 12 types as the actual first step of onboarding (lib/eventTypes.ts,
// EVENT_TYPE_LIST) -- same icons too, matching EVENT_TYPE_ICONS in
// OnboardingWizard.tsx -- so this promises nothing the picker itself
// doesn't already deliver. Each gets its own tint so the grid itself makes
// the point ("every occasion, not one theme of occasion") instead of just
// asserting it in the heading.
const EVENT_TYPES_SHOWCASE: EventTypeShowcaseItem[] = [
  { icon: Heart, label: "Wedding", blurb: "The one this whole platform is built around.", tint: "bg-orange-50 text-[var(--dash-accent-text)]" },
  { icon: Cake, label: "Birthday", blurb: "A countdown, photos, and a gift list that isn't awkward.", tint: "bg-rose-50 text-rose-600" },
  { icon: Building2, label: "Corporate event", blurb: "Share the agenda, get a real headcount for catering.", tint: "bg-blue-50 text-blue-600" },
  { icon: GraduationCap, label: "Graduation", blurb: "Ceremony details and the reception, one link.", tint: "bg-emerald-50 text-emerald-600" },
  { icon: Sparkles, label: "Anniversary", blurb: "However many years in, still worth a proper site.", tint: "bg-violet-50 text-violet-600" },
  { icon: Baby, label: "Baby shower", blurb: "Registry links and a guestbook full of wishes.", tint: "bg-sky-50 text-sky-600" },
  { icon: Crown, label: "Quinceañera", blurb: "Court, dress code, and the dance schedule.", tint: "bg-pink-50 text-pink-600" },
  { icon: Award, label: "Retirement", blurb: "Toast a career, not just hand over a cake.", tint: "bg-amber-50 text-amber-700" },
  { icon: PartyPopper, label: "Kids' party", blurb: "Playful themes, RSVPs parents actually fill out.", tint: "bg-lime-50 text-lime-700" },
  { icon: PartyPopper, label: "Holiday party", blurb: "Office party details, dress code included.", tint: "bg-red-50 text-red-600" },
  { icon: Gem, label: "Engagement", blurb: "Share the news, save the wedding site for later.", tint: "bg-fuchsia-50 text-fuchsia-600" },
  { icon: CalendarHeart, label: "Anything else", blurb: "Whatever it is, it starts the same way: pick a theme.", tint: "bg-stone-100 text-stone-600" },
];

interface EventTypesSectionProps {
  ctaHref: string;
}

/** dashboard-audit.md Block E part 2: the hero above stays wedding-first on
 * purpose (that's still the flagship use case), but the platform genuinely
 * isn't wedding-only -- lib/eventTypes.ts's 12 types are real, load-bearing
 * data (onboarding's own first step), not a marketing claim invented for
 * this section. Placed immediately under the hero, in its own tinted band,
 * specifically so a birthday/corporate visitor doesn't bounce off a page
 * that reads as wedding-only before reaching "What's included." */
export default function EventTypesSection({ ctaHref }: EventTypesSectionProps) {
  return (
    <section className="border-t border-stone-100 bg-stone-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--dash-accent-text)]">
            Not just weddings
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            Every celebration gets its own site
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-stone-600">
            Pick your event type first, and everything after — the wording, the fields, even what
            the seating tool is called — is built around it.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {EVENT_TYPES_SHOWCASE.map(({ icon: Icon, label, blurb, tint }) => (
            <div key={label} className="rounded-xl border border-stone-200 bg-white p-5">
              <span className={`flex h-10 w-10 items-center justify-center rounded-full ${tint}`}>
                <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-stone-900">{label}</h3>
              <p className="mt-1 text-sm text-stone-600">{blurb}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href={ctaHref}
            className="inline-block rounded-full bg-gradient-to-r from-[var(--dash-accent)] to-red-600 px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition hover:from-[var(--dash-accent-hover)] hover:to-red-700"
          >
            Pick your event type
          </Link>
        </div>
      </div>
    </section>
  );
}
