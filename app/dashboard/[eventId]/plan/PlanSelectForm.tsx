"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { plans, DEFAULT_PLAN_ID } from "@/lib/plans";
import { updatePlan, createCheckoutSession } from "./actions";

interface PlanSelectFormProps {
  eventId: string;
  currentPlanId: string;
}

export default function PlanSelectForm({ eventId, currentPlanId }: PlanSelectFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState(currentPlanId);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // Direct feedback: three equal-weight cards (Free / Basic / Premium) read
  // as "pick one of three options" and buried the free path's real cost (a
  // permanent "Made with Invimbo" badge + 3 locked site modules) behind
  // wording that made it look like just another peer tier. Free stays fully
  // real and one click away -- publishing on it was never gated -- but it's
  // demoted to a small opt-out link so a host lands on "here's your result"
  // by default rather than "here are three prices, good luck."
  const [showFree, setShowFree] = useState(currentPlanId === DEFAULT_PLAN_ID);

  // Stripe redirects back here with ?checkout=success once payment
  // completes -- the actual plan_id write happens separately, in the
  // webhook (it's the only side that knows payment truly succeeded), so
  // this is purely a "thanks, hang on" message while that lands; refresh
  // once to pick it up in case the webhook beat the redirect back.
  const checkoutStatus = searchParams.get("checkout");
  useEffect(() => {
    if (checkoutStatus === "success") {
      router.refresh();
    }
  }, [checkoutStatus, router]);

  const handleSelect = (planId: string) => {
    setError(null);

    if (planId === DEFAULT_PLAN_ID) {
      setSelected(planId);
      startTransition(async () => {
        const result = await updatePlan({ eventId, planId });
        if (result.ok) {
          router.refresh();
        } else {
          setError(result.message);
        }
      });
      return;
    }

    // Paid plans go through Stripe Checkout, not a direct DB write --
    // navigating away mid-transition is fine, so this doesn't touch
    // `selected` (a plan the host hasn't actually paid for yet shouldn't
    // show as chosen while they're still on the Stripe page).
    startTransition(async () => {
      const result = await createCheckoutSession({ eventId, planId });
      if (result.ok) {
        window.location.href = result.url;
      } else {
        setError(result.message);
      }
    });
  };

  const basic = plans.basic;
  const free = plans.free;
  const premium = plans.premium;
  const isBasicOrHigher = selected === "basic" || selected === "premium";

  return (
    <div>
      <h1 className="dash-h1 text-gray-900">Get your link</h1>
      <p className="mt-1 text-sm text-gray-500">
        Your site is designed — this is the last step before it&rsquo;s really yours.
      </p>
      {/* Competitor research (weddingpost.ru): "the constructor itself is
          always free" works best as its own standalone reassurance line
          stated before any price, not left implicit in the surrounding
          copy -- a host arriving here after designing for free shouldn't
          have to infer that design itself was never what they're paying
          for. */}
      <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800">
        ✓ Designing your site is free, always — you only pay if you want this exact link live.
      </p>

      {checkoutStatus === "success" && (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Payment received — your plan will update in a moment.
        </p>
      )}
      {checkoutStatus === "cancelled" && (
        <p className="mt-4 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
          Checkout cancelled — nothing was charged.
        </p>
      )}

      {/* Direct feedback: this used to be one of three equal-weight cards,
          which read as "pick a tier" rather than "here's your result."
          Basic is the one plan that actually changes what a guest sees on
          the link itself (no badge, no locked modules, a real custom
          address) -- it's the featured, default path now. Already-paid
          hosts (Basic/Premium) see a plain confirmation instead of a sales
          pitch for the plan they're already on. */}
      {isBasicOrHigher ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <p className="text-sm font-semibold text-emerald-900">
            ✓ You&rsquo;re on {selected === "premium" ? "Premium" : "Basic"} — your link is ready.
          </p>
          <p className="mt-1 text-sm text-emerald-800">
            No badge, no locked modules. Hit <span className="font-semibold">Publish site</span> at the top of any
            page, or claim a custom address from the Site tab.
          </p>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border-2 border-[var(--dash-accent)] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-[var(--dash-accent-text)]">{basic.name} — the finished result</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">€{basic.priceEur}</p>
          <p className="text-xs text-gray-500">one-time, not a subscription</p>
          <ul className="mt-4 space-y-1.5 text-sm text-gray-700">
            {basic.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-0.5 text-[var(--dash-accent)]">✓</span>
                {feature}
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSelect(basic.id)}
            className="dash-btn dash-btn-primary mt-5 w-full text-base"
          >
            {isPending ? "Redirecting…" : `Get your link — €${basic.priceEur}`}
          </button>
          <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600">
            🔒 Processed securely by Stripe
          </span>

          {/* Free stays fully real (publishing was never gated on payment)
              but reads as the opt-out now, not a peer option. */}
          {!showFree ? (
            <button
              type="button"
              onClick={() => setShowFree(true)}
              className="mt-4 block text-xs font-medium text-gray-400 underline decoration-dotted hover:text-gray-600"
            >
              Or publish free instead, with a &ldquo;Made with Invimbo&rdquo; badge
            </button>
          ) : (
            <div className="mt-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
              <p className="text-sm font-bold text-amber-900">⚠️ This is what guests will actually see on Free</p>

              {/* Direct feedback: a plain bullet-point list ("shows a
                  badge") undersold what that actually looks like -- a host
                  should see it, not just read about it, before picking
                  Free. Mirrors components/site/PublicSiteBadge.tsx's real
                  markup/position (fixed bottom-left corner) at a smaller
                  scale; colors are a neutral approximation since the real
                  badge pulls from the event's own theme (--theme-bg/-text/
                  -accent), not available on this plan-selection page. */}
              <div className="relative mt-3 h-28 overflow-hidden rounded-lg border border-amber-200 bg-gradient-to-br from-stone-100 to-stone-200">
                <span className="absolute left-3 top-2.5 text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                  Guest view
                </span>
                <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-white/85 px-2.5 py-1 text-[10px] font-semibold text-stone-700 shadow-sm backdrop-blur-sm">
                  <span className="text-amber-600">✦</span>
                  Made with Invimbo
                </span>
              </div>
              <p className="mt-2 text-xs font-medium text-amber-800">
                That badge sits on every page, for every guest, permanently — it isn&rsquo;t removable on Free.
              </p>

              <ul className="mt-3 space-y-1 text-xs text-amber-800">
                {free.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
                <li>Countdown, gift wishes &amp; dress-code modules locked</li>
              </ul>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSelect(free.id)}
                className="dash-btn dash-btn-secondary mt-3 w-full text-sm"
              >
                Publish free instead
              </button>
            </div>
          )}
        </div>
      )}

      {/* Premium doesn't change the link at all (see lib/plans.ts) -- it
          only removes the watermark from printed invitations/table cards --
          so folding it into the same "get your link" choice above misled a
          host into thinking it was a bigger/better version of the same
          thing. Shown separately, framed around paper specifically. */}
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <p className="text-sm font-semibold text-gray-900">Printing invitations or table cards?</p>
        <p className="mt-1 text-sm text-gray-500">
          {premium.name} (€{premium.priceEur}) removes the watermark from your paper set — doesn&rsquo;t change the
          link itself.
        </p>
        <button
          type="button"
          disabled={isPending || selected === "premium"}
          onClick={() => handleSelect(premium.id)}
          className="dash-btn dash-btn-secondary mt-3 text-sm"
        >
          {selected === "premium" ? "You're on Premium" : `Upgrade — €${premium.priceEur}`}
        </button>
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
