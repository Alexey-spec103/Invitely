-- Pricing scaffold: which plan an owner has picked. No payment is collected
-- yet (see lib/plans.ts + app/dashboard/plan) — this just gives the eventual
-- Stripe integration a column to write to, and the UI something to show.
-- No RLS change needed: the existing owner-update policy on events already
-- covers this column row-wise.

alter table public.events
  add column plan_id text not null default 'free';
