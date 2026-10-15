-- Schema-drift sweep (2026-10-15), second fix: set_site_password (the
-- "password-protect your site" feature) is completely broken right now.
--
-- It was written SECURITY INVOKER on purpose (20260910120000's own
-- comment: "it runs as the calling user and is still subject to the
-- existing 'owners can update own events' RLS policy -- the owner_id =
-- auth.uid() check here is belt-and-suspenders"), explicitly relying on
-- authenticated keeping its UPDATE grant on site_password_hash. That
-- migration only ever revoked SELECT on that column, never UPDATE.
--
-- But 20261009150000 and 20261012120000 (the plan_id and
-- custom_domain_verified_at lockdowns) each REBUILD the entire events
-- UPDATE grant from scratch via a dynamic column list, and both of their
-- exclusion lists swept up site_password_hash along with the columns they
-- actually meant to lock down -- an unintended regression, not a deliberate
-- re-lockdown of this column's UPDATE privilege (confirmed: the live grant
-- dump shows authenticated has no UPDATE on site_password_hash at all).
-- SECURITY INVOKER's internal `update ... set site_password_hash = ...`
-- now fails outright with a permission-denied error for every host who
-- tries to set a password -- not a degraded case, a total outage of this
-- whole feature.
--
-- Fix: same SECURITY DEFINER + explicit search_path pattern already used
-- for the identical problem shape on custom_domain_verified_at
-- (20261012120000's own mark_custom_domain_verified/
-- clear_custom_domain_verification) and for site_password_hash's own
-- sibling verify_site_password -- the owner_id = auth.uid() check already
-- inside this function's WHERE clause is untouched and keeps doing the
-- real authorization work; SECURITY DEFINER only lifts the column-grant
-- restriction, not who's allowed to call it for which event.

create or replace function public.set_site_password(p_event_id uuid, p_password text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.events
  set
    site_password_hash = crypt(p_password, gen_salt('bf')),
    site_password_enabled = true,
    site_password_unlock_token = encode(gen_random_bytes(16), 'hex')
  where id = p_event_id and owner_id = auth.uid();
end;
$$;

grant execute on function public.set_site_password(uuid, text) to authenticated;
