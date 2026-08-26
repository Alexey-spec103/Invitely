-- Every guest gets a "Copy invite link" button (shipped earlier), but
-- nothing recorded whether the host actually sent it. The Guests page's
-- status strip only ever reported "attending / not attending / awaiting
-- response" -- "awaiting response" conflates "sent, no answer yet" with
-- "never contacted at all", which matters at the 100+-guest scale the
-- bulk-import feature targets. Nullable, purely informational -- never
-- enforced, never blocks anything.

alter table public.guests
  add column if not exists invitation_sent_at timestamptz;
