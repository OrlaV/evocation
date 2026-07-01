-- ============================================================
-- 013 — Newsletter signups (2026-07-01)
-- A place to capture "notify me about new revivals" emails from visitors who
-- aren't buying today (long consideration cycle on niche parts). Written by a
-- server action with the service role; RLS is fully locked (no anon/auth
-- access — the service role bypasses it). Idempotent. Apply after 012.
-- ============================================================

create table if not exists public.newsletter_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,                       -- where they signed up (e.g. 'footer')
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.newsletter_signups enable row level security;
-- no policies on purpose: only the service role (server) touches this table.
