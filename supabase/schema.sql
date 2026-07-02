-- ============================================================
-- EVOCATION — schéma Supabase (Phase 2)
-- À exécuter dans le SQL Editor du projet Supabase (une seule fois).
-- Script idempotent : ré-exécutable sans risque.
-- ============================================================

-- extension trigram pour la recherche par référence (AVANT l'index qui l'utilise)
create extension if not exists pg_trgm with schema extensions;

-- ---------- helper: normalisation des références constructeur ----------
-- "928.521.147.02" / "928521 147 02" -> "92852114702"
create or replace function public.normalize_ref(t text)
returns text
language sql
immutable
as $$
  select upper(regexp_replace(t, '[^a-zA-Z0-9]', '', 'g'))
$$;

-- ---------- produits ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  evo_no text unique not null,                  -- "EVO-001"
  slug text unique not null,                    -- "interior-cup-handle-range-rover-classic"
  name text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),

  -- références constructeur d'origine (preuve NLA + SEO)
  oem_refs text[] not null default '{}',
  search_refs text,                             -- normalisées, maintenues par trigger
  maker text,                                   -- "Land Rover", "Porsche"

  -- biographie de pièce
  fitted_from int,
  fitted_to int,
  discontinued_year text,                       -- "~2002" (approximatif autorisé)
  revived_year int,

  -- compatibilité véhicule
  fitment jsonb not null default '[]',          -- [{make, model, body?, phase?, hand?, years}]

  -- specs (le matériau est une donnée PAR PIÈCE — décision 2026-06-12)
  material text not null default 'ASA, automotive grade',

  -- prix & disponibilité
  price_pence int not null,
  lead_time_days int not null default 5,
  in_stock boolean not null default false,      -- false = printed to order
  used_price_note text,                         -- ancrage prix occasion, ex. "£80+"

  -- contenu
  story_md text,
  faq jsonb not null default '[]',              -- [{q, a}]
  gallery jsonb not null default '[]',          -- [{path, alt}] (Supabase Storage)

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- trigger : maintient search_refs + updated_at
create or replace function public.products_before_write()
returns trigger
language plpgsql
as $$
begin
  new.search_refs := (
    select string_agg(public.normalize_ref(r), ' ')
    from unnest(new.oem_refs) as r
  );
  new.updated_at := now();
  return new;
end
$$;

drop trigger if exists trg_products_before_write on public.products;
create trigger trg_products_before_write
  before insert or update on public.products
  for each row execute function public.products_before_write();

create index if not exists idx_products_status on public.products (status);
create index if not exists idx_products_search_refs
  on public.products using gin (search_refs extensions.gin_trgm_ops);

-- purchase options : configurations achetables (côté gauche/droit, paire, lot)
-- au sein d'UN produit, avec prix explicite par option. jsonb, pas de table
-- dédiée. [{key, label, price_pence, items:[{ref, qty}]}] (décision 2026-06-29).
alter table public.products
  add column if not exists options jsonb not null default '[]';

-- badge : tag de statut éditable affiché sur la carte & la fiche
-- ("NLA", "Hard to find", "Cracks with age"…). Plus rien en dur (2026-06-29).
alter table public.products
  add column if not exists badge text default 'NLA';

-- parcel : DÉPRÉCIÉ (remplacé par `slots`). Conservé pour compat. (2026-06-29)
alter table public.products
  add column if not exists parcel text not null default 'small';

-- slots : indice de taille d'expédition par produit, sommé au panier au checkout
-- pour choisir le carton (small ≤15, medium ≤45, large au-delà). Surchargeable
-- par option d'achat (jsonb). (2026-06-29)
alter table public.products
  add column if not exists slots int not null default 5;

-- ---------- file de résurrection ----------
create table if not exists public.queue_requests (
  id uuid primary key default gen_random_uuid(),
  part_label text not null,                     -- nom ou référence saisie
  ref_normalized text,                          -- normalisée si c'est une ref
  make text,                                    -- marque sélectionnée (ex. "Porsche")
  model text,                                   -- modèle sélectionné (ex. "928")
  email text not null,
  -- voting (2026-06-30) : demander ET voter exigent un compte. user_id lie la
  -- ligne au compte ; request_key regroupe demandes & votes de la MÊME pièce.
  user_id uuid references auth.users(id) on delete set null,
  request_key text,
  -- 'request' = demande/vote de résurrection ; 'order_intent' = intention
  -- d'achat (NotifyMe), gardée hors du board.
  kind text not null default 'request',
  created_at timestamptz not null default now()
);

-- migration pour une table déjà créée (idempotent)
alter table public.queue_requests add column if not exists make text;
alter table public.queue_requests add column if not exists model text;
alter table public.queue_requests
  add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.queue_requests add column if not exists request_key text;
alter table public.queue_requests
  add column if not exists kind text not null default 'request';

create index if not exists idx_queue_ref on public.queue_requests (ref_normalized);
create index if not exists idx_queue_make on public.queue_requests (make);

-- ---------- commandes (remplies par le webhook Stripe) ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique,
  email text,
  user_id uuid references auth.users(id) on delete set null,  -- compte acheteur si connecté
  amount_pence int,
  items jsonb,                                  -- [{product_id, evo_no, name, qty, price_pence}]
  shipping jsonb,                               -- adresse Stripe
  status text not null default 'paid' check (status in ('paid', 'printed', 'shipped', 'refunded')),
  tracking_number text,                         -- n° de suivi Royal Mail
  shipped_at timestamptz,                       -- posé quand l'email d'expédition part
  refunded_at timestamptz,                      -- posé quand l'email de remboursement part
  order_no bigint generated by default as identity,  -- n° lisible (O-0007)
  created_at timestamptz not null default now()
);
-- migration idempotente pour une table déjà créée
alter table public.orders add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.orders add column if not exists tracking_number text;
alter table public.orders add column if not exists shipped_at timestamptz;
alter table public.orders add column if not exists refunded_at timestamptz;
alter table public.orders add column if not exists order_no bigint generated by default as identity;
create index if not exists idx_orders_user_id on public.orders (user_id);

-- ---------- RLS ----------
alter table public.products enable row level security;
alter table public.queue_requests enable row level security;
alter table public.orders enable row level security;

-- lecture publique des produits publiés uniquement
drop policy if exists "public read published products" on public.products;
create policy "public read published products"
  on public.products for select
  using (status = 'published');

-- file de résurrection : demander/voter exige un compte (2026-06-30).
-- L'utilisateur insère ses propres lignes et peut relire les siennes ;
-- l'agrégation publique de la home se fait côté serveur en service role.
drop policy if exists "public can join queue" on public.queue_requests;
drop policy if exists "users insert own queue rows" on public.queue_requests;
create policy "users insert own queue rows"
  on public.queue_requests for insert to authenticated
  with check (
    user_id = auth.uid()
    and email = auth.email()
    and kind = 'request'
  );
drop policy if exists "users read own queue rows" on public.queue_requests;
create policy "users read own queue rows"
  on public.queue_requests for select to authenticated
  using (user_id = auth.uid());

-- orders : le client lit SES commandes (par email) via le client session ;
-- le webhook Stripe écrit en service role (bypass). Les policies ADMIN (is_admin)
-- sont en fin de fichier, après la définition de la fonction.
drop policy if exists "customers read own orders" on public.orders;
create policy "customers read own orders"
  on public.orders for select to authenticated
  using (email = auth.email() or user_id = auth.uid());

-- ---------- newsletter (voir migration 013) ----------
-- capture "notify me about new revivals" — écrit en service role, RLS verrouillée.
create table if not exists public.newsletter_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'unsubscribed')),  -- double opt-in (016/017)
  token uuid not null default gen_random_uuid(),
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_newsletter_token on public.newsletter_signups (token);
alter table public.newsletter_signups enable row level security;

-- ---------- garage (voir migration 014) ----------
create table if not exists public.garage_vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  make text not null,
  model text not null,
  year int,
  hand text,
  vehicle_key text not null,
  created_at timestamptz not null default now(),
  unique (user_id, vehicle_key)
);
create index if not exists idx_garage_user on public.garage_vehicles (user_id);
alter table public.garage_vehicles enable row level security;

-- ---------- return_requests (voir migration 015) ----------
create table if not exists public.return_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  reason text not null,
  details text,
  status text not null default 'open'
    check (status in ('open', 'approved', 'declined', 'resolved')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_returns_order on public.return_requests (order_id);
alter table public.return_requests enable row level security;

-- ---------- reviews (voir migration 016) ----------
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

-- ---------- wishlist (voir migration 018) ----------
create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
create index if not exists idx_wishlist_user on public.wishlist_items (user_id);
alter table public.wishlist_items enable row level security;
-- (policies for garage/returns/reviews/wishlist live in migrations 014/015/016/018)

-- ---------- storage : images produits ----------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "public read product images" on storage.objects;
create policy "public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- ============================================================
-- Phase 2b — VEHICLE MATCHING (centralisation marque/modèle)
-- Clé véhicule canonique partagée entre products.fitment et
-- queue_requests, pour matcher une demande à un produit (et notifier).
-- Idempotent — ré-exécutable.
-- ============================================================

-- "Porsche 928" / "porsche  928" -> "porsche" ; "928" -> "928"
create or replace function public.vehicle_slug(t text)
returns text
language sql
immutable
as $$
  select nullif(
    trim(both '-' from regexp_replace(lower(coalesce(t, '')), '[^a-z0-9]+', '-', 'g')),
    ''
  )
$$;

-- ---------- products : clés de fitment dérivées ----------
alter table public.products
  add column if not exists fitment_keys text[] not null default '{}';

-- on étend le trigger d'écriture des produits : il maintient aussi fitment_keys
-- = un "make-slug|model-slug" par ligne de fitment ayant une marque ET un modèle.
create or replace function public.products_before_write()
returns trigger
language plpgsql
as $$
begin
  new.search_refs := (
    select string_agg(public.normalize_ref(r), ' ')
    from unnest(new.oem_refs) as r
  );
  new.fitment_keys := coalesce((
    select array_agg(distinct
      public.vehicle_slug(f->>'make') || '|' || public.vehicle_slug(f->>'model'))
    from jsonb_array_elements(new.fitment) as f
    where public.vehicle_slug(f->>'make') is not null
      and public.vehicle_slug(f->>'model') is not null
  ), '{}');
  new.updated_at := now();
  return new;
end
$$;

create index if not exists idx_products_fitment_keys
  on public.products using gin (fitment_keys);

-- ---------- queue_requests : clé véhicule + drapeau notifié ----------
alter table public.queue_requests add column if not exists make_key text;
alter table public.queue_requests add column if not exists model_key text;
alter table public.queue_requests add column if not exists vehicle_key text;
alter table public.queue_requests add column if not exists notified_at timestamptz;

create or replace function public.queue_before_write()
returns trigger
language plpgsql
as $$
begin
  new.make_key := public.vehicle_slug(new.make);
  new.model_key := public.vehicle_slug(new.model);
  new.vehicle_key := case
    when new.make_key is not null and new.model_key is not null
    then new.make_key || '|' || new.model_key
    else null
  end;
  -- stable key to group requests/votes for the same part (vote de-dup + counts)
  new.request_key := coalesce(
    nullif(new.request_key, ''),
    nullif(new.ref_normalized, ''),
    case
      when new.vehicle_key is not null
      then new.vehicle_key || ':' || public.normalize_ref(coalesce(new.part_label, ''))
      else public.normalize_ref(coalesce(new.part_label, ''))
    end
  );
  return new;
end
$$;

drop trigger if exists trg_queue_before_write on public.queue_requests;
create trigger trg_queue_before_write
  before insert or update on public.queue_requests
  for each row execute function public.queue_before_write();

create index if not exists idx_queue_vehicle_key
  on public.queue_requests (vehicle_key);
-- one vote per registered user per part (anonymous legacy rows exempt)
create unique index if not exists uniq_queue_user_part
  on public.queue_requests (user_id, request_key)
  where user_id is not null;
create index if not exists idx_queue_request_key
  on public.queue_requests (request_key);

-- ---------- backfill des lignes existantes (re-déclenche les triggers) ----------
update public.products set fitment = fitment;
update public.queue_requests set make = make;

-- ============================================================
-- Donor offers (2026-06-30) — un propriétaire propose de nous prêter un
-- original : on le scanne/contrôle, puis on lui renvoie SA pièce + une copie
-- 3D imprimée gratuite. Compte requis. Idempotent.
-- ============================================================
create table if not exists public.donor_offers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  make text,
  model text,
  make_key text,
  model_key text,
  vehicle_key text,
  part_label text not null,
  ref_normalized text,
  condition text,                               -- état de l'original proposé
  notes text,
  status text not null default 'new'
    check (status in ('new', 'accepted', 'received', 'returned', 'declined')),
  created_at timestamptz not null default now()
);

create or replace function public.donor_before_write()
returns trigger
language plpgsql
as $$
begin
  new.make_key := public.vehicle_slug(new.make);
  new.model_key := public.vehicle_slug(new.model);
  new.vehicle_key := case
    when new.make_key is not null and new.model_key is not null
    then new.make_key || '|' || new.model_key
    else null
  end;
  return new;
end
$$;

drop trigger if exists trg_donor_before_write on public.donor_offers;
create trigger trg_donor_before_write
  before insert or update on public.donor_offers
  for each row execute function public.donor_before_write();

create index if not exists idx_donor_vehicle on public.donor_offers (vehicle_key);
create index if not exists idx_donor_status on public.donor_offers (status);

alter table public.donor_offers enable row level security;
drop policy if exists "users insert own donor offers" on public.donor_offers;
create policy "users insert own donor offers"
  on public.donor_offers for insert to authenticated
  with check (
    user_id = auth.uid()
    and email = auth.email()
    and status = 'new'
  );
drop policy if exists "users read own donor offers" on public.donor_offers;
create policy "users read own donor offers"
  on public.donor_offers for select to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- Admins (2026-06-30) — source de vérité du rôle admin. RLS verrouillée
-- (service role only) ; les tests passent par is_admin() (security definer),
-- utilisable aussi dans les policies RLS des autres tables. ADMIN_EMAILS reste
-- un filet côté app. Seeder le 1er admin (voir migration 009).
-- ============================================================
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  added_at timestamptz not null default now()
);

alter table public.admins enable row level security;
-- aucune policy anon/authenticated : seul le service role y touche directement.

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

-- ---------- policies ADMIN (dépendent de is_admin(), donc après sa définition) ----------
-- L'admin gère tout au niveau base ; les users gardent leur read-own (008/orders).
drop policy if exists "admins manage orders" on public.orders;
create policy "admins manage orders"
  on public.orders for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage queue" on public.queue_requests;
create policy "admins manage queue"
  on public.queue_requests for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage donor offers" on public.donor_offers;
create policy "admins manage donor offers"
  on public.donor_offers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- l'admin peut lire la liste d'équipe avec un client session (écritures en service role)
drop policy if exists "admins read admins" on public.admins;
create policy "admins read admins"
  on public.admins for select to authenticated
  using (public.is_admin());

-- ============================================================
-- Profiles (2026-06-30) — 1 profil par compte (nom, tél, adresse sauvegardée,
-- opt-in, Stripe Customer id). Auto-créé à l'inscription. Écritures via server
-- actions (service role, payload whitelisté) ; lecture par le propriétaire.
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
  address_country text,                 -- ISO-2
  marketing_opt_in boolean not null default false,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile"
  on public.profiles for select to authenticated
  using (user_id = auth.uid());
drop policy if exists "admins read profiles" on public.profiles;
create policy "admins read profiles"
  on public.profiles for select to authenticated
  using (public.is_admin());

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
