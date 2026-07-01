-- ============================================================
-- 014 — My Garage (2026-07-01)
-- The cars a customer owns. Powers "fits your car" surfacing and (later)
-- per-model revival alerts. Owner manages their own rows; admins can read.
-- vehicle_key mirrors lib/vehicles.vehicleKey(make, model) for matching against
-- products.fitment_keys. Idempotent. Apply after 013.
-- ============================================================

create table if not exists public.garage_vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  make text not null,
  model text not null,
  year int,
  hand text,                              -- 'LHD' | 'RHD' | null
  vehicle_key text not null,              -- "porsche|928" (make-slug|model-slug)
  created_at timestamptz not null default now(),
  unique (user_id, vehicle_key)
);

create index if not exists idx_garage_user on public.garage_vehicles (user_id);

alter table public.garage_vehicles enable row level security;

-- owner manages their own garage; admins may read
drop policy if exists "users manage own garage" on public.garage_vehicles;
create policy "users manage own garage"
  on public.garage_vehicles for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "admins read garage" on public.garage_vehicles;
create policy "admins read garage"
  on public.garage_vehicles for select to authenticated
  using (public.is_admin());
