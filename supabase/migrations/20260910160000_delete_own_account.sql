-- Self-service account deletion (GDPR). No service-role key needed: the
-- Supabase Admin API (auth.admin.deleteUser) would require one, purely for
-- this one action -- instead this follows Supabase's own documented
-- self-service pattern, a SECURITY DEFINER function that deletes
-- auth.users where id = auth.uid(). There's no id parameter to spoof, so a
-- caller can only ever delete their own account. Supabase's own internal
-- auth tables (identities, sessions, refresh tokens) already cascade on
-- auth.users deletion.
--
-- App data (events and everything under them) is deleted beforehand by the
-- caller via lib/events.ts's existing deleteEvent(), not by this function --
-- events.owner_id's own FK/cascade behavior is unverified (the events
-- table predates this migration history), so this intentionally doesn't
-- rely on it either.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_own_account() to authenticated;
