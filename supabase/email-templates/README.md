# Supabase auth email templates — Evocation

Branded HTML bodies for the Supabase auth/security emails (the ones sent by
**Supabase**, not the order emails — those live in `lib/order-emails.ts`).

## How to install
Supabase → **Authentication → Email Templates** → open a template → paste the
matching file's content into the body → Save. (Set up custom SMTP → Resend first
so they actually send and aren't rate-limited.)

Email clients strip custom fonts, so the logo is the **"EVOCATION" wordmark in
styled text** + the corsa-red bar — robust everywhere. To use the real logo
image instead: upload a PNG to the public `product-images` bucket and replace
the `<div>…EVOCATION…</div>` with `<img src="https://…/logo.png" height="18" alt="Evocation">`.

## Authentication templates

| Supabase template | File | Notes |
|---|---|---|
| **Confirm sign up** | `confirm-signup.html` | ✅ Used — we confirm email on signup. |
| **Reset password** | `reset-password.html` | ✅ Used — the "Forgot password?" flow. |
| Invite user | — | ❌ Skip — signups are open, we never invite. |
| Magic link or OTP | — | ❌ Skip — login is email + password only. |
| Change email address | — | ❌ Skip — changing email isn't offered in the profile. |
| Reauthentication | — | ❌ Skip — no flow triggers it (password change is direct). |

## Security templates (toggles)

| Supabase template | File | Notes |
|---|---|---|
| **Password changed** | `password-changed.html` | ✅ Worth enabling — users can change their password in /account/profile. Turn the toggle ON and paste the body. |
| Email address changed | — | ❌ Skip — changing email isn't offered. |
| Phone number changed | — | ❌ Skip — no phone auth. |
| Sign-in method linked / removed | — | ❌ Skip — only email+password, no linked providers. |
| MFA method added / removed | — | ❌ Skip — MFA isn't enabled. |

> If you later add a feature (e.g. change-email, magic link, MFA), brand its
> template the same way — copy one of these files and swap the heading/body.

## Template variables used
- `{{ .ConfirmationURL }}` — the action link (confirm / reset). Works with our
  `/auth/callback` route.
- `{{ .Email }}` — the recipient's address.
- `{{ .SiteURL }}` — set this to `https://www.evocation.store` in Supabase
  (Authentication → URL Configuration) so links resolve to the live domain.
