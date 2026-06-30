# Supabase migrations

Incremental SQL changes to the live database, applied **in order** in the
Supabase SQL Editor. `schema.sql` (one level up) stays the full baseline for a
fresh project; these numbered files are the change-log on top of it.

Convention: `NNN-short-description.sql`, zero-padded, incrementing. Each file is
idempotent where possible (`add column if not exists`, target by `slug`, etc.)
so re-running it is safe.

| # | File | What it does |
|---|------|--------------|
| 001 | `001-add-product-badge-column.sql` | Adds the editable `badge` status tag column |
| 002 | `002-update-seat-hinge-cover.sql` | Rewrites the Porsche Seat Hinge Cover (copy, fitment, options, badge) |
| 003 | `003-fix-pocket-pull-mxc1306.sql` | Corrects the "cup handle" into the real Door Pocket Pull (MXC1306) → `EVO-LR-0001` |
| 004 | `004-add-land-rover-vents.sql` | Adds the Facia Vent Louvre (`EVO-LR-0002`) & Demister Vent (`EVO-LR-0003`) as drafts |
| 005 | `005-add-product-parcel-column.sql` | Adds the `parcel` column (Royal Mail size → shipping cost) |
| 006 | `006-add-product-slots.sql` | Replaces `parcel` with a numeric `slots` shipping index (backfilled) |
| 007 | `007-add-app-settings.sql` | Adds `app_settings` (editable shipping rates / thresholds via /admin/settings) |
| 008 | `008-queue-votes-and-donor-offers.sql` | Queue voting (`queue_requests.user_id` + `request_key`, 1 vote/user/part, auth-only RLS) + new `donor_offers` table |
| 009 | `009-admins-table.sql` | Real admin/user split: `admins` table + `is_admin()` security-definer fn (seeds the bootstrap admin by email). `ADMIN_EMAILS` stays as break-glass fallback |
| 010 | `010-rls-admin-and-self-access.sql` | RLS hardening via `is_admin()`: customers read own orders, admins manage orders/queue/donors, admins read the team list |
| 011 | `011-orders-fulfilment.sql` | Orders get `user_id`, `tracking_number`, `shipped_at`/`refunded_at`, human `order_no`; customer read RLS also matches `user_id` |
| 012 | `012-profiles.sql` | `profiles` table (name, phone, saved address, marketing opt-in, `stripe_customer_id`), auto-created on sign-up; RLS read-own + admins read |

> Note: the `options jsonb` column was added earlier directly via `schema.sql`
> (already live), so it has no numbered migration. Numbering starts at 001 here.
