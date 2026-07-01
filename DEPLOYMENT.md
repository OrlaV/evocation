# Deployment checklist — Evocation

Everything needed to take the site live on Vercel. Items marked **[you]** need
your accounts/decisions; the rest is done in code.

## 1. Git (not yet committed — do this first)

The project lives in `evocation/` and has only the initial Create-Next-App
commit. Get the real work into version control and onto a remote:

```bash
cd evocation
git add -A
git commit -m "Evocation: storefront, checkout, queue, accounts, admin"
# create an empty private repo on GitHub first, then:
git remote add origin git@github.com:<you>/evocation.git
git push -u origin main
```

`.env.local` is gitignored — secrets never leave your machine. Good.

## 2. Vercel **[you]**

1. Import the GitHub repo (OrlaV/evocation) at vercel.com → New Project. The
   Next app is at the repo root, so leave Root Directory as default.
2. Framework preset: Next.js (auto-detected). No build overrides needed.
3. Add the environment variables below (Project → Settings → Environment
   Variables), then Deploy.

## 3. Environment variables

Copy from `.env.local`, plus the two new ones at the bottom:

| Var | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** — server only |
| `STRIPE_SECRET_KEY` | Use the **live** key for production |
| `STRIPE_WEBHOOK_SECRET` | From the **production** webhook endpoint (step 5) |
| `STRIPE_TAX_ENABLED` | `true` only after Stripe Tax is configured |
| `ADMIN_EMAILS` | Break-glass admin allowlist (the DB `admins` table is the main source) |
| `RESEND_API_KEY` | Already set |
| **`RESEND_FROM`** | Sending address on the verified Resend domain — set to `contact@evocation.store`. Until set, order emails stay inert. |
| **`NEXT_PUBLIC_SITE_URL`** | The production URL, e.g. `https://www.evocation.store` (this is the default). Set it explicitly in Vercel. |

## 4. Supabase config **[you]**

- **Migrations**: ensure `supabase/migrations/001…012` are all applied (and
  `schema.sql` is the baseline for a fresh project).
- **Auth → URL Configuration**:
  - Site URL = your production URL.
  - Redirect URLs: add `https://<domain>/auth/callback` (and keep
    `http://localhost:3000/auth/callback` for local). ✅ already added for dev.
- **Auth → Emails**: configure **custom SMTP** for production — the default
  Supabase email sender has low rate limits (confirmation/reset emails).
- **Storage**: the `product-images` bucket is public (created by `schema.sql`).

## 5. Stripe (production) **[you]**

1. Switch to live mode; put the live `STRIPE_SECRET_KEY` in Vercel.
2. Create a webhook endpoint → `https://<domain>/api/stripe/webhook`,
   events: `checkout.session.completed`,
   `checkout.session.async_payment_succeeded`. Copy its signing secret into
   `STRIPE_WEBHOOK_SECRET`.
3. (Optional) Stripe Tax: configure, then set `STRIPE_TAX_ENABLED=true`.
4. Prices are read from the DB at checkout — nothing to maintain in Stripe.

## 6. Domain **[you]**

Point your domain (evocation.uk / evocation-parts.com / …) at Vercel, set it as
Site URL in Supabase, and as `NEXT_PUBLIC_SITE_URL`.

## 7. Post-deploy smoke test

- [ ] Homepage, /shop search, a product page load.
- [ ] Sign up → confirmation email arrives → link logs you in.
- [ ] Forgot password → reset email → set new password.
- [ ] Save a profile address → it prefills at checkout.
- [ ] A real (or Stripe test) order → webhook writes it → confirmation email →
      appears in /admin/orders and /account.
- [ ] Mark an order shipped with a tracking number → customer gets the email.
- [ ] OG image: paste a product URL into a link preview / opengraph.xyz.

## 8. Still optional / future

Real product photos + hero image (biggest visual lever), EU/Worldwide shipping
rates, reviews/testimonials, newsletter integration, error monitoring (Sentry),
about-page personal copy + photo.
