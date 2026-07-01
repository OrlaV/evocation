-- ============================================================
-- 016 — Customer reviews (2026-07-01)
-- Verified-buyer, moderated reviews. Public reads APPROVED rows only; a
-- signed-in customer inserts their own (the server action enforces they bought
-- the part and sets verified_buyer); admins moderate everything. One review per
-- customer per product. Idempotent. Apply after 015.
-- ============================================================

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  author_name text,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  verified_buyer boolean not null default false,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);

create index if not exists idx_reviews_product on public.reviews (product_id, status);

alter table public.reviews enable row level security;

-- anyone may read approved reviews
drop policy if exists "public read approved reviews" on public.reviews;
create policy "public read approved reviews"
  on public.reviews for select
  using (status = 'approved');

-- a signed-in customer inserts / reads their own review
drop policy if exists "users create own review" on public.reviews;
create policy "users create own review"
  on public.reviews for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users read own reviews" on public.reviews;
create policy "users read own reviews"
  on public.reviews for select to authenticated
  using (user_id = auth.uid());

-- admins moderate everything
drop policy if exists "admins manage reviews" on public.reviews;
create policy "admins manage reviews"
  on public.reviews for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
