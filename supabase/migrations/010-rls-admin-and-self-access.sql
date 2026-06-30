-- ============================================================
-- 010 — RLS hardening: the admin/user split goes down to Postgres (2026-06-30)
-- Customers can read their OWN data via the session client (least privilege —
-- the account page no longer needs the service role); admins (is_admin()) get
-- full access at the DB level. The service role still bypasses RLS for the
-- server back-office and the Stripe webhook. Idempotent. Apply after 009.
-- ============================================================

-- ---------- orders ----------
alter table public.orders enable row level security;

-- a logged-in customer sees only orders placed with their account email
drop policy if exists "customers read own orders" on public.orders;
create policy "customers read own orders"
  on public.orders for select to authenticated
  using (email = auth.email());

-- admins see / manage every order
drop policy if exists "admins manage orders" on public.orders;
create policy "admins manage orders"
  on public.orders for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- queue_requests (users already insert/read own — 008) ----------
drop policy if exists "admins manage queue" on public.queue_requests;
create policy "admins manage queue"
  on public.queue_requests for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- donor_offers (users already insert/read own — 008) ----------
drop policy if exists "admins manage donor offers" on public.donor_offers;
create policy "admins manage donor offers"
  on public.donor_offers for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- admins (table otherwise fully locked — 009) ----------
-- admins may read the team list with a session client; writes still go through
-- the service role (auth.users lookup needs it anyway).
drop policy if exists "admins read admins" on public.admins;
create policy "admins read admins"
  on public.admins for select to authenticated
  using (public.is_admin());
