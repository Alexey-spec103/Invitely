-- dashboard-audit.md B11: weddingpost.ru's Style constructor lets a host
-- hold several candidate themes side by side ("Слоты стилей" -- a card per
-- theme + an empty "+" slot) and revert to a past choice via a small
-- version-history icon (⟲). Neither concept exists in this schema today --
-- site_config.theme_id is a single scalar column, and updateTheme() has
-- always been a destructive overwrite with no trace of the prior value.
--
-- theme_slots holds only the *extra* candidate themes a host is holding
-- onto beyond the currently-active one (site_config.theme_id remains the
-- single source of truth for "active"; a slot is just a saved-for-later
-- theme id, not a parallel site_config). theme_history is an insert-only
-- log populated by updateTheme() every time the active theme actually
-- changes, pruned to the most recent 20 rows per event.
--
-- Same RLS shape as banquet_tables (20260814140000): owner-scoped via
-- events.owner_id = auth.uid(), no public/anon access at all -- these are
-- purely a host's own private design-picking state.

create table if not exists public.theme_slots (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  theme_id text not null,
  created_at timestamptz not null default now()
);

alter table public.theme_slots enable row level security;

drop policy if exists "Owners can read their own theme slots" on public.theme_slots;
create policy "Owners can read their own theme slots"
on public.theme_slots
for select
to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = theme_slots.event_id
      and events.owner_id = auth.uid()
  )
);

drop policy if exists "Owners can insert their own theme slots" on public.theme_slots;
create policy "Owners can insert their own theme slots"
on public.theme_slots
for insert
to authenticated
with check (
  exists (
    select 1 from public.events
    where events.id = theme_slots.event_id
      and events.owner_id = auth.uid()
  )
);

drop policy if exists "Owners can delete their own theme slots" on public.theme_slots;
create policy "Owners can delete their own theme slots"
on public.theme_slots
for delete
to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = theme_slots.event_id
      and events.owner_id = auth.uid()
  )
);

create table if not exists public.theme_history (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  theme_id text not null,
  changed_at timestamptz not null default now()
);

alter table public.theme_history enable row level security;

drop policy if exists "Owners can read their own theme history" on public.theme_history;
create policy "Owners can read their own theme history"
on public.theme_history
for select
to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = theme_history.event_id
      and events.owner_id = auth.uid()
  )
);

drop policy if exists "Owners can insert their own theme history" on public.theme_history;
create policy "Owners can insert their own theme history"
on public.theme_history
for insert
to authenticated
with check (
  exists (
    select 1 from public.events
    where events.id = theme_history.event_id
      and events.owner_id = auth.uid()
  )
);

-- Needed so updateTheme() can prune rows past the most recent 20 for an
-- event -- without this, the owner-scoped select/insert policies above
-- would still let history grow unbounded.
drop policy if exists "Owners can delete their own theme history" on public.theme_history;
create policy "Owners can delete their own theme history"
on public.theme_history
for delete
to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = theme_history.event_id
      and events.owner_id = auth.uid()
  )
);

create index if not exists theme_slots_event_id_idx on public.theme_slots(event_id);
create index if not exists theme_history_event_id_changed_at_idx on public.theme_history(event_id, changed_at desc);
