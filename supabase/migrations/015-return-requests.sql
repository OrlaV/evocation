-- ============================================================
-- 015 — Return requests (2026-07-01)
-- Self-service side of the "fits or refunded" guarantee: a customer can raise a
-- return on one of their orders; the admin resolves it (approve → refund via
-- the existing Stripe action, or decline). Owner reads/creates their own;
-- admins manage all. Idempotent. Apply after 014.
-- ============================================================

create table if not exists public.return_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  reason text not null,                   -- "doesn't fit" | "faulty" | "other"
  details text,
  status text not null default 'open'
    check (status in ('open', 'approved', 'declined', 'resolved')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_returns_order on public.return_requests (order_id);
create index if not exists idx_returns_status on public.return_requests (status);

alter table public.return_requests enable row level security;

-- a customer creates and reads their own return requests
drop policy if exists "users create own returns" on public.return_requests;
create policy "users create own returns"
  on public.return_requests for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users read own returns" on public.return_requests;
create policy "users read own returns"
  on public.return_requests for select to authenticated
  using (user_id = auth.uid());

-- admins manage every return request
drop policy if exists "admins manage returns" on public.return_requests;
create policy "admins manage returns"
  on public.return_requests for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
