-- ============================================================
-- 018 — Wishlist / favourites (2026-07-01)
-- Parts a signed-in customer saved for later. Owner manages their own rows.
-- Idempotent. Apply after 017.
-- ============================================================

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists idx_wishlist_user on public.wishlist_items (user_id);

alter table public.wishlist_items enable row level security;

drop policy if exists "users manage own wishlist" on public.wishlist_items;
create policy "users manage own wishlist"
  on public.wishlist_items for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
