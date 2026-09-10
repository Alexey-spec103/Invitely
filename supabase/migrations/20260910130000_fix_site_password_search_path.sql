-- Fix for 20260910120000_events_site_password.sql: Supabase installs
-- pgcrypto's functions (crypt, gen_salt, gen_random_bytes) into the
-- `extensions` schema, not `public`. `verify_site_password`'s explicit
-- `set search_path = public` (needed for SECURITY DEFINER safety) shadowed
-- that, so every password verification failed with "function crypt(text,
-- text) does not exist" -- confirmed live via a direct RPC call. Both
-- functions now explicitly include `extensions` in their search_path
-- instead of relying on the caller's default.

create or replace function public.set_site_password(p_event_id uuid, p_password text)
returns void
language plpgsql
security invoker
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
