-- Password-protect the public site (parity with Zola/Joy/The Knot/Squarespace/
-- Wix, who all ship this free on every plan). See the "Security note" in the
-- implementation plan for why the hash column needs an explicit REVOKE: this
-- table's public-read RLS policy (`status = 'published'`) grants access to
-- every column of a published row via Supabase's REST API to anon/authenticated,
-- not just the columns our own app code happens to select -- so without this,
-- anyone with the (public-by-design) anon key could read site_password_hash
-- directly over the REST API and crack it offline, regardless of what our
-- Next.js queries request.

create extension if not exists pgcrypto;

alter table public.events
  add column if not exists site_password_enabled boolean not null default false,
  add column if not exists site_password_hash text,
  add column if not exists site_password_unlock_token text;

-- UPDATE privilege is untouched -- the owner can still set/clear this via a
-- normal `.update()` (through the functions below). Only raw SELECT of this
-- one column is blocked, for every role.
revoke select (site_password_hash) on public.events from anon, authenticated;

-- Owner-only write path. SECURITY INVOKER is enough: it runs as the calling
-- user and is still subject to the existing "owners can update own events"
-- RLS policy -- the `owner_id = auth.uid()` check here is belt-and-suspenders.
-- Regenerates the unlock token every call, so any previously-issued guest
-- cookie stops working the moment the password changes or is re-enabled.
create or replace function public.set_site_password(p_event_id uuid, p_password text)
returns void
language plpgsql
security invoker
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

-- SECURITY DEFINER is the one place allowed to read the locked-down hash
-- column, and only ever returns the opaque unlock token (or null) -- never
-- the hash itself -- to the caller, who may be an anonymous guest.
create or replace function public.verify_site_password(p_event_id uuid, p_password text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash text;
  v_enabled boolean;
  v_token text;
begin
  select site_password_hash, site_password_enabled, site_password_unlock_token
    into v_hash, v_enabled, v_token
    from public.events
    where id = p_event_id;

  if v_hash is null or not v_enabled then
    return null;
  end if;

  if v_hash = crypt(p_password, v_hash) then
    return v_token;
  end if;

  return null;
end;
$$;

grant execute on function public.set_site_password(uuid, text) to authenticated;
grant execute on function public.verify_site_password(uuid, text) to anon, authenticated;
