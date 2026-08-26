-- Custom-domain support: owners can point their own domain at their event's
-- public site. Ownership is proven via a DNS TXT record challenge before the
-- domain is trusted for routing (see resolveCustomDomain in lib/supabase/proxy.ts).
-- No RLS changes needed: the existing "Owners can update their own events" /
-- "Public can read published events" policies already cover these columns
-- row-wise (RLS is row-level, not column-level).

alter table public.events
  add column custom_domain text,
  add column custom_domain_verification_token text,
  add column custom_domain_verified_at timestamptz;

alter table public.events
  add constraint events_custom_domain_key unique (custom_domain);
