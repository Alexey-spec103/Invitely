-- Follow-up to 20261015130000: verified live after applying it that setting
-- a site password still failed, with a NEW error -- "function gen_salt(unknown)
-- does not exist". Root cause: `set search_path = public` (needed to make
-- the function SECURITY DEFINER-safe at all) also cuts off resolution of
-- pgcrypto's functions (gen_salt/crypt/gen_random_bytes), since Supabase
-- provisions extensions into a dedicated `extensions` schema by default, not
-- `public` -- the original 20260910120000 migration's bare
-- `create extension if not exists pgcrypto` landed there, not in `public`.
--
-- set_site_password (SECURITY INVOKER before 20261015130000, no explicit
-- search_path) never hit this, since it inherited the calling session's own
-- default search_path, which already includes `extensions`. Switching it to
-- SECURITY DEFINER is what first exposed the gap.
--
-- verify_site_password has been SECURITY DEFINER with `set search_path =
-- public` since it was first written (20260910120000) and calls `crypt()`
-- too -- almost certainly broken the exact same way since day one, just
-- never caught because nothing in this session (or apparently since launch)
-- actually tried unlocking a password-protected guest page. Fixed here too,
-- not just the function this sweep happened to catch first.
--
-- Fix: add `extensions` to both functions' search_path rather than
-- schema-qualifying every pgcrypto call -- `public, extensions` is
-- Supabase's own documented pattern for this exact situation, and stays
-- correct regardless of which specific schema a given project's pgcrypto
-- ends up installed in (own projects can differ).

create or replace function public.set_site_password(p_event_id uuid, p_password text)
returns void
language plpgsql
security definer
set search_path = public, extensions
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

create or replace function public.verify_site_password(p_event_id uuid, p_password text)
returns text
language plpgsql
security definer
set search_path = public, extensions
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
