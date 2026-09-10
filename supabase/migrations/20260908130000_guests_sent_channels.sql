-- dashboard-audit.md B18: records which channel(s) a host actually used to
-- send a guest their invite (link copy / WhatsApp / SMS / email) -- honest
-- equivalent of weddingpost.ru's "delivery status" given Invitely has no
-- real SMS/email delivery backend to report true delivery receipts from.
alter table public.guests
  add column if not exists sent_channels text[] not null default '{}'::text[];
