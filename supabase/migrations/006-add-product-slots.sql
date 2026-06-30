-- 006 — Replace the per-product parcel size (small/medium/large) with a numeric
-- shipping "slots" index (2026-06-29). The cart sums slots × qty at checkout to
-- pick the box: small ≤15, medium ≤45, large above. `parcel` is kept but unused.
-- Run once in the Supabase SQL Editor.

alter table public.products
  add column if not exists slots int not null default 5;

-- one-time backfill from the old parcel tier (only rows still at the default 5,
-- so re-running won't clobber values you've since set in /admin)
update public.products
set slots = case parcel
  when 'large' then 60
  when 'medium' then 20
  else 5
end
where slots = 5;

notify pgrst, 'reload schema';
