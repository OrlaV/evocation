-- ============================================================
-- 020 — Contact messages (2026-07-02)
-- Stores submissions from the contact form (homepage §06 + /contact) so a
-- message is never lost even when the notification email fails or Resend
-- isn't configured. Written by a server action with the service role; RLS is
-- fully locked (no anon/auth access). Idempotent. Apply after 019.
-- ============================================================

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  source text,                       -- where it was sent from (e.g. 'home', 'contact')
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;
-- no policies on purpose: only the service role (server) touches this table.
