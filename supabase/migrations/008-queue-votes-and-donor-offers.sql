-- ============================================================
-- 008 — Resurrection queue: registered-user voting + donor offers
-- Section 4 of the homepage now reflects the DB. Requesting AND voting
-- require an account (decision 2026-06-30); a separate donor programme lets
-- an owner lend us an original (we scan/inspect it, return it + a free 3D copy).
-- Idempotent. Apply in the Supabase SQL Editor after 007.
-- ============================================================

-- ---------- queue_requests: tie rows to a user + a stable grouping key ----------
alter table public.queue_requests
  add column if not exists user_id uuid references auth.users(id) on delete set null;
-- request_key groups requests & votes for the SAME part (vote de-dup + counts):
-- the OEM ref when present, else vehicle_key + normalized part label.
alter table public.queue_requests
  add column if not exists request_key text;
-- kind separates resurrection requests/votes ('request') from product-page
-- purchase-intent rows written by NotifyMe ('order_intent', kept off the board).
alter table public.queue_requests
  add column if not exists kind text not null default 'request';

-- extend the before-write trigger to also maintain request_key
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

-- one vote per registered user per part (anonymous legacy rows are exempt)
create unique index if not exists uniq_queue_user_part
  on public.queue_requests (user_id, request_key)
  where user_id is not null;
create index if not exists idx_queue_request_key
  on public.queue_requests (request_key);

-- tag legacy purchase-intent rows so they stay off the resurrection board
update public.queue_requests
  set kind = 'order_intent'
  where part_label ilike 'Order interest%';

-- backfill request_key on existing rows (re-fires the trigger)
update public.queue_requests set make = make;

-- RLS: registered users insert their own rows and may read their own back
drop policy if exists "public can join queue" on public.queue_requests;
drop policy if exists "users insert own queue rows" on public.queue_requests;
create policy "users insert own queue rows"
  on public.queue_requests for insert to authenticated
  with check (user_id = auth.uid());
drop policy if exists "users read own queue rows" on public.queue_requests;
create policy "users read own queue rows"
  on public.queue_requests for select to authenticated
  using (user_id = auth.uid());

-- ---------- donor offers ----------
-- An owner offers to send us an original part. We scan & inspect it, then
-- return the original to them plus a free 3D-printed copy. Account required.
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
  condition text,                               -- condition of the original
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
  with check (user_id = auth.uid());
drop policy if exists "users read own donor offers" on public.donor_offers;
create policy "users read own donor offers"
  on public.donor_offers for select to authenticated
  using (user_id = auth.uid());
