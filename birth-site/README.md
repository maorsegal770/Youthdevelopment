# Birth-prep site – Rachel Lea Segal

Landing page, lead form, member registration with secure payment, and a members-only
course area for a doula / birth-prep instructor. Hebrew, RTL.

**Stack:** React + Vite + Tailwind · Supabase (Auth, Postgres + RLS, Edge Functions) ·
Stripe Checkout · Resend · Netlify.

| Doc | |
|---|---|
| [docs/SETUP.md](docs/SETUP.md) | Step-by-step setup and go-live checklist (Hebrew) |
| [docs/PRD.md](docs/PRD.md) | Product requirements |
| [docs/USER_STORIES.md](docs/USER_STORIES.md) | User stories and acceptance criteria |

## Local development

```bash
cp .env.example .env     # fill in your Supabase URL and anon key
npm install
npm run dev
```

Without `.env` the landing page still renders with built-in fallback content.

## Layout

```
src/
  pages/        Landing, Register, Login, ForgotPassword, ResetPassword,
                Lessons, PaymentSuccess, Leads
  components/   Layout, Editable (inline admin editing), ContactForm, ui
  lib/          supabase client, auth context, useTable, api helpers, config
supabase/
  migrations/   schema + row level security
  seed.sql      starting content
  functions/    submit-lead, create-checkout, verify-checkout, stripe-webhook
  templates/    Hebrew OTP confirmation email
```

## Security model

- Row level security on every table. `is_admin()` / `is_active_member()` helpers.
- Users can update only `display_name`, `phone`, `due_date` on their profile
  (column grants); `role` and `subscription_status` change only via the service role.
- Leads are inserted only by the `submit-lead` function.
- Card data never reaches this app: Stripe hosted Checkout. Membership is activated
  only after server-side verification (signed webhook + session lookup bound to the user).

## Tests

```bash
npx deno test supabase/functions/_shared/functions_test.ts   # webhook signature, lead validation
```
