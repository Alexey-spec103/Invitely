import Link from "next/link";
import {
  Heart,
  Sparkles,
  Gem,
  Cake,
  Baby,
  Candy,
  PartyPopper,
  Crown,
  GraduationCap,
  Building2,
  Award,
  CalendarHeart,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

// Same 12 types, same order, as landing.eventTypes.items in
// lib/i18n/translations/en.ts -- icon/tint stay here (design, not
// copy), zipped against the translated label/blurb by index below.
// Same icons as EVENT_TYPE_ICONS in OnboardingWizard.tsx too, matching
// lib/eventTypes.ts's own EVENT_TYPE_LIST, so this promises nothing the
// picker itself doesn't already deliver.
const EVENT_TYPE_ICONS: LucideIcon[] = [Heart, Cake, Building2, GraduationCap, Sparkles, Baby, Crown, Award, Candy, PartyPopper, Gem, CalendarHeart];
const EVENT_TYPE_TINTS = [
  "bg-orange-50 text-[var(--dash-accent-text)]",
  "bg-rose-50 text-rose-600",
  "bg-blue-50 text-blue-600",
  "bg-emerald-50 text-emerald-600",
  "bg-violet-50 text-violet-600",
  "bg-sky-50 text-sky-600",
  "bg-pink-50 text-pink-600",
  "bg-amber-50 text-amber-700",
  "bg-lime-50 text-lime-700",
  "bg-red-50 text-red-600",
  "bg-fuchsia-50 text-fuchsia-600",
  "bg-stone-100 text-stone-600",
];

interface EventTypesSectionProps {
  ctaHref: string;
  locale: Locale;
}

/** dashboard-audit.md Block E part 2: the hero above stays wedding-first on
 * purpose (that's still the flagship use case), but the platform genuinely
 * isn't wedding-only -- lib/eventTypes.ts's 12 types are real, load-bearing
 * data (onboarding's own first step), not a marketing claim invented for
 * this section. Placed immediately under the hero, in its own tinted band,
 * specifically so a birthday/corporate visitor doesn't bounce off a page
 * that reads as wedding-only before reaching "What's included." */
export default function EventTypesSection({ ctaHref, locale }: EventTypesSectionProps) {
  const t = getDictionary(locale).landing.eventTypes;

  return (
    <section className="border-t border-stone-100 bg-stone-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">{t.heading}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-stone-600">{t.subtext}</p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {t.items.map(({ label, blurb }, index) => {
            const Icon = EVENT_TYPE_ICONS[index];
            return (
              <div
                key={label}
                className="landing-reveal-item rounded-xl border border-stone-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
                style={{ "--stagger-i": index % 8 } as CSSProperties}
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-full ${EVENT_TYPE_TINTS[index]}`}>
                  <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-stone-900">{label}</h3>
                <p className="mt-1 text-sm text-stone-600">{blurb}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link href={ctaHref} className="landing-cta px-6 py-3 text-sm">
            {t.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
