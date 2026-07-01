-- ============================================================
-- 017 — Newsletter double opt-in (2026-07-01)
-- Add a confirmation step: a signup starts 'pending' with a token; the emailed
-- link flips it to 'confirmed'. Prevents enrolling someone else's address
-- (GDPR consent). RLS stays service-role only. Idempotent. Apply after 016.
-- ============================================================

alter table public.newsletter_signups
  add column if not exists status text not null default 'pending';
-- widen any legacy rows and constrain the values
do $$
begin
  alter table public.newsletter_signups
    add constraint newsletter_status_chk
    check (status in ('pending', 'confirmed', 'unsubscribed'));
exception when duplicate_object then null;
end $$;

alter table public.newsletter_signups
  add column if not exists token uuid not null default gen_random_uuid();
alter table public.newsletter_signups
  add column if not exists confirmed_at timestamptz;

-- existing rows (created before double opt-in) are treated as confirmed
update public.newsletter_signups
  set status = 'confirmed', confirmed_at = coalesce(confirmed_at, created_at)
  where status = 'pending' and created_at < now() - interval '1 minute';

create index if not exists idx_newsletter_token on public.newsletter_signups (token);
