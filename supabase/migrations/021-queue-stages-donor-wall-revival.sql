-- ============================================================
-- 021 — Queue stages, donor wall consent, revival auto-notify (2026-07-02)
-- Three related features:
--   1) products.revival_notified_at — set when the automatic revival email
--      batch has run for a part (publish-time trigger in saveProductAction),
--      so re-saving a published part never re-mails garage owners.
--   2) queue_stages — admin-set workshop stage per queue item (request_key),
--      shown on the public board as progress ("scanning", "printing"…).
--   3) donor_offers.public_name / display_consent — donors OPT IN to being
--      credited by name on the public donor wall; default is anonymous.
-- Idempotent. Apply in the Supabase SQL Editor after 020.
-- ============================================================

-- 1) revival auto-notification guard
alter table public.products
  add column if not exists revival_notified_at timestamptz;

-- 2) per-part workshop stage for the resurrection queue
create table if not exists public.queue_stages (
  request_key text primary key,
  stage text not null default 'queued'
    check (stage in ('queued', 'scanning', 'modelling', 'printing', 'revived')),
  updated_at timestamptz not null default now()
);

alter table public.queue_stages enable row level security;
-- no policies on purpose: written by admin server actions (service role);
-- the public board reads it server-side through lib/queue.ts.

-- 3) donor wall consent (opt-in by the donor at submission time)
alter table public.donor_offers
  add column if not exists public_name text;
alter table public.donor_offers
  add column if not exists display_consent boolean not null default false;
