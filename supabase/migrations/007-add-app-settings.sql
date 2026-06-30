-- 007 — Adjustable business settings (shipping rates, slot thresholds…) editable
-- from /admin/settings (2026-06-29). Single jsonb row. Read/written via the
-- service role only (server) — RLS on, no anon policy. Idempotent.

create table if not exists public.app_settings (
  id int primary key default 1,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  constraint app_settings_singleton check (id = 1)
);

alter table public.app_settings enable row level security;
-- no anon/authenticated policy: only the service role (server) can read/write.

insert into public.app_settings (id, value)
values (1, '{}')
on conflict (id) do nothing;

notify pgrst, 'reload schema';
