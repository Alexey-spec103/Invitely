-- Stripe audit (2026-10-17): the webhook (app/api/stripe/webhook/route.ts)
-- only ever handled checkout.session.completed -- there was no handling of
-- charge.refunded or charge.dispute.*, and critically no record anywhere of
-- *which* Stripe charge/payment_intent paid for a given event's current
-- plan_id. Without that link, a refund or lost dispute webhook has no way
-- to know which event to downgrade -- the plan would stay unlocked forever
-- even after the money was returned.
--
-- One column is enough: this product only ever has one "live" paid charge
-- per event at a time (one-time payment per upgrade, no subscriptions, see
-- createCheckoutSession's own comment on that), so there's no need for a
-- separate payments-history table -- just remember the payment_intent that
-- most recently unlocked this row's plan_id, the same way plan_id itself
-- only ever tracks the current tier, not history.
alter table public.events
  add column if not exists stripe_payment_intent_id text;

comment on column public.events.stripe_payment_intent_id is
  'Stripe PaymentIntent id behind this event''s current plan_id, set by the checkout webhook and matched against charge.refunded/charge.dispute.* to find which event to downgrade. Null on Free or any event that has never completed a paid checkout.';

-- Same reasoning and same dynamic-grant pattern as
-- 20261009150000_lock_plan_id_column_grant.sql's own column-grant section:
-- this column must only ever be written by the webhook's service-role
-- client, never by an authenticated dashboard user directly against the
-- REST API (there is no legitimate authenticated write path for it at all,
-- unlike plan_id's real "downgrade to Free" case) -- so it belongs in the
-- same excluded set as last_digest_sent_at/site_password_hash, not left to
-- the default grant every other column gets.
do $$
declare
  grantable_columns text;
begin
  select string_agg(quote_ident(column_name), ', ' order by column_name)
  into grantable_columns
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'events'
    and column_name not in ('last_digest_sent_at', 'site_password_hash', 'stripe_payment_intent_id');

  execute 'revoke update on public.events from anon, authenticated';
  execute format('grant update (%s) on public.events to anon, authenticated', grantable_columns);
end $$;

notify pgrst, 'reload schema';
