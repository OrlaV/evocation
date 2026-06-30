-- ============================================================
-- 012 — Customer profiles (2026-06-30)
-- One profile per account: name, phone, a saved shipping address, marketing
-- opt-in, and the linked Stripe Customer id (for checkout prefill). Auto-created
-- on sign-up. Idempotent. Apply after 011.
-- ============================================================

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  address_line1 text,
  address_line2 text,
  address_city text,
  address_state text,
  address_postal_code text,
  address_country text,                 -- ISO-2 (GB, FR, …)
  marketing_opt_in boolean not null default false,
  stripe_customer_id text,              -- set by the app (service role) — never trust the client
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- the owner reads their profile; writes go through server actions (service role)
-- with a whitelisted payload, so stripe_customer_id can't be spoofed.
drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile"
  on public.profiles for select to authenticated
  using (user_id = auth.uid());
drop policy if exists "admins read profiles" on public.profiles;
create policy "admins read profiles"
  on public.profiles for select to authenticated
  using (public.is_admin());

-- auto-create a profile row whenever an account is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id) values (new.id) on conflict do nothing;
  return new;
end
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- backfill existing accounts
insert into public.profiles (user_id)
select id from auth.users
on conflict do nothing;
