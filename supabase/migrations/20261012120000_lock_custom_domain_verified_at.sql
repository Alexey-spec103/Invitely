-- security-review (2026-10-12): the plan_id migration (20261009150000)
-- explicitly flagged and deferred this one -- domain-actions.ts's
-- checkDomainVerification() only sets custom_domain_verified_at = now()
-- from the *authenticated* client after its own app-layer DNS TXT-record
-- check (resolveTxt), and claimInvimboSubdomain() does the same
-- unconditionally for a free invimbo.com subdomain (legitimate -- we own
-- that domain, there's nothing to prove). Like plan_id before its fix, the
-- "owners can update their own events" RLS policy scopes *rows*, not
-- *columns* -- any authenticated user can already PATCH their own event's
-- custom_domain_verified_at directly via the REST API, skipping the real
-- TXT check entirely. lib/supabase/proxy.ts routes live traffic purely on
-- custom_domain = hostname AND custom_domain_verified_at IS NOT NULL, so
-- this column alone is the entire proof-of-ownership gate for domain
-- routing -- bypassing it lets an attacker claim routing for a domain they
-- don't control.
--
-- Unlike plan_id (where a trigger comparing NEW/OLD and checking
-- auth.role() was enough), the real check here -- did a DNS TXT lookup
-- actually succeed -- can only happen in application code (Next.js has no
-- equivalent inside Postgres). A trigger can't help: SECURITY DEFINER
-- changes which role's *grants* apply, not what auth.role()/auth.uid()
-- report, so a trigger gating on auth.role() = 'service_role' would still
-- see 'authenticated' even from inside a SECURITY DEFINER function and
-- block the legitimate write along with the exploit.
--
-- This project deliberately avoids a third service-role client in app code
-- (see lib/supabase/service.ts's own comment -- the Stripe webhook and the
-- RSVP digest cron are the two intentional exceptions). A SECURITY DEFINER
-- RPC scoped to auth.uid(), matching every other write in this app that
-- needs elevated privilege (find_or_create_self_service_guest,
-- verify_site_password, etc.), is the right tool: it runs with the
-- function owner's privileges (bypassing the column revoke below) while
-- still checking the *caller's* identity against events.owner_id itself,
-- so it can't be invoked on an event the caller doesn't own.
--
-- Two RPCs, not one, because the column has two legitimate write
-- directions and only one of them is dangerous: clearing the flag (when a
-- host requests a new domain or removes one) only ever hurts the host's
-- own routing, never grants anything -- no DNS proof is needed to allow it.
create or replace function public.mark_custom_domain_verified(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.events where id = p_event_id and owner_id = auth.uid()) then
    raise exception 'Not authorized';
  end if;
  update public.events set custom_domain_verified_at = now() where id = p_event_id;
end;
$$;

create or replace function public.clear_custom_domain_verification(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.events where id = p_event_id and owner_id = auth.uid()) then
    raise exception 'Not authorized';
  end if;
  update public.events set custom_domain_verified_at = null where id = p_event_id;
end;
$$;

grant execute on function public.mark_custom_domain_verified(uuid) to authenticated;
grant execute on function public.clear_custom_domain_verification(uuid) to authenticated;

-- Same dynamic-column-list approach as 20261009150000, for the same reason
-- (this repo's migrations and the live database have drifted before): reads
-- the live column list at apply time so this GRANT can never go stale,
-- it only ever needs to keep excluding the three protected columns.
do $$
declare
  grantable_columns text;
begin
  select string_agg(quote_ident(column_name), ', ' order by column_name)
  into grantable_columns
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'events'
    and column_name not in ('last_digest_sent_at', 'site_password_hash', 'custom_domain_verified_at');

  execute 'revoke update on public.events from anon, authenticated';
  execute format('grant update (%s) on public.events to anon, authenticated', grantable_columns);
end $$;

notify pgrst, 'reload schema';
