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
    priceEur: 29,
    features: [
      "Everything in Free",
      "Custom domain",
      "Countdown, gift wishes & dress-code modules",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    priceEur: 59,
    features: [
      "Everything in Basic",
      "Personalized paper invitations (PDF)",
      "Banquet seating & table cards",
    ],
  },
};

export const DEFAULT_PLAN_ID = "free";
