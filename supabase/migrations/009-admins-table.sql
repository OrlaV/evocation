-- ============================================================
-- 009 — Admin role in the DB (2026-06-30)
-- A real user/admin distinction: `admins` is the source of truth and
-- `is_admin()` (security definer) backs both the server guard and RLS on
-- other tables. ADMIN_EMAILS stays in the app as a break-glass fallback so a
-- misconfigured table can't lock everyone out. Idempotent. Apply after 008.
-- ============================================================

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  added_at timestamptz not null default now()
);

-- Intentionally NO anon/authenticated policies: only the service role touches
-- this table directly (server actions after requireAdmin). Membership tests go
-- through public.is_admin() below, never a direct client read.
alter table public.admins enable row level security;

-- auth.uid() is read from the request JWT, so it resolves correctly even inside
-- a security-definer function. Usable in RLS policies on any table, e.g.
--   create policy "admins read all" on public.orders for select using (public.is_admin());
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon, service_role;

-- bootstrap: seed the first admin by email (idempotent). Change the email for
-- a fresh project, or add admins later via /admin/team.
insert into public.admins (user_id, email)
select id, email
from auth.users
where lower(email) = lower('orlando.vedovato@gmail.com')
on conflict (user_id) do nothing;
