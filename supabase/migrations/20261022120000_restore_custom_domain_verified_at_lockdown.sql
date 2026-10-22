-- security-baseline audit (2026-10-22): 20261012120000 locked
-- custom_domain_verified_at out of the authenticated/anon UPDATE grant on
-- public.events, since it's the entire proof-of-ownership gate for custom-
-- domain routing (see that migration's own comment -- lib/supabase/
-- proxy.ts routes live traffic purely on custom_domain = hostname AND
-- custom_domain_verified_at IS NOT NULL, with no other check). Because
-- each of these grant migrations does a full revoke+rebuild from a fresh
-- exclusion list rather than an incremental change, 20261017120000 (added
-- 5 days later, to protect the new stripe_payment_intent_id column)
-- silently dropped custom_domain_verified_at back into the grantable set
-- -- its own exclusion list only named
-- (last_digest_sent_at, site_password_hash, stripe_payment_intent_id).
-- Confirmed no migration since has touched this grant. Net effect: any
-- authenticated user could directly PATCH their own event's
-- custom_domain_verified_at via the REST API, bypassing the real DNS
-- TXT-record check in domain-actions.ts entirely -- exactly the exploit
-- 20261012120000 was written to close.
--
-- Rebuilds the grant once more with the full, correct exclusion list (all
-- four protected columns). mark_custom_domain_verified/
-- clear_custom_domain_verification (the SECURITY DEFINER RPCs from
-- 20261012120000) are unaffected by this and remain the only legitimate
-- write path for this column.
do $$
declare
  grantable_columns text;
begin
  select string_agg(quote_ident(column_name), ', ' order by column_name)
  into grantable_columns
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'events'
    and column_name not in (
      'last_digest_sent_at',
      'site_password_hash',
      'custom_domain_verified_at',
      'stripe_payment_intent_id'
    );

  execute 'revoke update on public.events from anon, authenticated';
  execute format('grant update (%s) on public.events to anon, authenticated', grantable_columns);
end $$;

notify pgrst, 'reload schema';
