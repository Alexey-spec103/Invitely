-- Pre-launch security pass (2026-10-27), follow-up to the RLS audit that
-- flagged 20261022160000's own gap: that migration narrowed `anon`'s
-- SELECT grant on events to a safe explicit list, but left `authenticated`
-- on the wide dynamic exclude-list grant from 20261022150000 (everything
-- except last_digest_sent_at/site_password_hash/site_password_unlock_token).
-- Combined with "Public can read published events" (to anon, authenticated
-- using (status = 'published')), ANY logged-in user -- not just an event's
-- owner -- could read custom_domain_verification_token and
-- stripe_payment_intent_id for every OTHER host's published event, over
-- the raw REST API, bypassing this app's own code entirely.
--
-- A full narrowing to match anon's grant was considered and rejected: a
-- live grep across app/dashboard/** found ~20 call sites that filter
-- `.eq("owner_id", user.id)` directly in their query (defense-in-depth
-- alongside RLS, the established pattern in this codebase -- see
-- domain-actions.ts's own fixes earlier today) -- Postgres requires SELECT
-- privilege on any column referenced in a WHERE clause, not just ones in
-- the output list, so revoking `owner_id` itself would break every one of
-- those call sites. Rewriting all of them to route through RPCs instead is
-- real, valuable follow-up work, but it's a much larger and riskier change
-- than this pass -- doing it carefully needs its own dedicated session with
-- real testing against the live database, not a rushed grant change no one
-- can even apply without the DB password.
--
-- Scoped down to just the two columns the audit actually confirmed as
-- sensitive: stripe_payment_intent_id (only ever read by the Stripe
-- webhook handler, which uses the service-role client -- confirmed via
-- grep, zero authenticated-role callers exist) and
-- custom_domain_verification_token (one legitimate authenticated reader:
-- checkDomainVerification, below, needs the *caller's own* token --
-- rewired to a narrow SECURITY DEFINER RPC instead of a direct column
-- read, same pattern as check_site_unlock_token).
create or replace function public.get_own_domain_verification_token(p_event_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text;
begin
  select custom_domain_verification_token into v_token
  from public.events
  where id = p_event_id and owner_id = auth.uid();

  return v_token;
end;
$$;

grant execute on function public.get_own_domain_verification_token(uuid) to authenticated;

-- Same dynamic-column-list rebuild as every other grant migration in this
-- project (20261015120000, 20261017120000, 20261022120000, 20261022150000)
-- -- reads the live column list at apply time so this can't go stale.
-- `anon` is untouched here (already narrowed, 20261022160000); this only
-- re-scopes `authenticated`.
do $$
declare
  select_columns text;
begin
  select string_agg(quote_ident(column_name), ', ' order by column_name)
  into select_columns
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'events'
    and column_name not in (
      'last_digest_sent_at', 'site_password_hash', 'site_password_unlock_token',
      'custom_domain_verification_token', 'stripe_payment_intent_id'
    );

  execute 'revoke select on public.events from authenticated';
  execute format('grant select (%s) on public.events to authenticated', select_columns);
end $$;

notify pgrst, 'reload schema';
