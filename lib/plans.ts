export interface Plan {
  id: string;
  name: string;
  priceEur: number;
  features: string[];
}

export const plans: Record<string, Plan> = {
  free: {
    id: "free",
    name: "Free",
    priceEur: 0,
    features: ["Event website with a designer theme", "Guest list", "RSVP tracking"],
  },
  basic: {
    id: "basic",
    name: "Basic",
    priceEur: 19,
    features: [
      "Everything in Free",
      "Custom domain",
      "Countdown, gift wishes & dress-code modules",
      "No \"Made with Invimbo\" site badge",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    priceEur: 35,
    features: [
      "Everything in Basic",
      "No paper watermark on personalized invitations",
      "No paper watermark on banquet & table cards",
    ],
  },
};

export const DEFAULT_PLAN_ID = "free";

/** dashboard-audit.md Block E: "try everything free, pay for the result" --
 * every plan can edit/preview/experiment with anything in the dashboard;
 * these tiers gate only the handful of *final-result* actions listed at
 * each call site (public rendering, custom-domain routing, Canvas
 * persistence, watermark removal). Ordered so `planMeets` can compare
 * tiers instead of every call site special-casing plan id strings. */
const PLAN_TIER = { free: 0, basic: 1, premium: 2 } as const;
type PlanTierName = keyof typeof PLAN_TIER;

export function planMeets(planId: string, minimum: PlanTierName): boolean {
  const tier = PLAN_TIER[planId as PlanTierName] ?? PLAN_TIER.free;
  return tier >= PLAN_TIER[minimum];
}

/** dashboard-audit.md Block E part 1: these three site modules are the
 * ones `plans.basic.features` actually names ("Countdown, gift wishes &
 * dress-code modules"). A host on any plan can toggle them on and see them
 * in the dashboard preview/SiteInlineEditor -- that's the free "try it"
 * part -- but the public site (app/e/[slug]/page.tsx) only renders them
 * once the event's plan actually meets Basic. */
export const BASIC_GATED_SECTION_TYPES = ["countdown", "gift", "dressCode"] as const;
