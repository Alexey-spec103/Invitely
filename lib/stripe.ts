import Stripe from "stripe";

// Lazy singleton, same pattern as lib/email.ts's Resend client -- avoids
// throwing at import time (which would break every page that imports
// anything from this module transitively) in favor of throwing only when a
// checkout/webhook path actually runs without STRIPE_SECRET_KEY configured.
let client: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!client) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    client = new Stripe(apiKey);
  }
  return client;
}
