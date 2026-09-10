-- dashboard-audit.md A7: weddingpost.ru's own "New invitation" modal has two
-- toggles (paper icon / phone icon), both on by default, controlling
-- whether *this* invitation gets a paper and/or site invite. Nullable-with-
-- default, informational like invitation_sent_at -- never enforced at the
-- RLS/RPC level, only used to decide what shows in the dashboard's own UI
-- (which guests appear in "Personalized invitations", whose "Copy invite
-- link" button is shown).

alter table public.guests
  add column if not exists paper_enabled boolean not null default true,
  add column if not exists site_enabled boolean not null default true;
