# Deploying OurAI

OurAI runs on **Vercel** (web) + **Supabase** (Postgres, Auth, Realtime). All
OurAI database objects live in a **dedicated `ourai` schema** so OurAI can share
an existing Supabase project **without ever touching that project's `public`
schema**.

> ⚠️ **Isolation guarantee.** Every migration creates objects only in `ourai`
> (`create table ourai.*`, `ourai.is_org_member`, etc.), and every client/query
> targets `ourai` (via `db: { schema: 'ourai' }` or the `Accept-Profile` /
> `Content-Profile: ourai` headers). Nothing OurAI does reads or writes
> `public`. The one surface that is inherently project-global is **Supabase
> Auth (`auth.users` / `auth.uid()`)** — a single Supabase project has one auth
> user pool. If OurAI must not share the auth pool with the other project on
> this Supabase instance, use a separate Supabase project/org instead.

## 1. Pick the target Supabase project

Confirm the exact project ref before applying anything. OurAI is designed to
live alongside an existing project by using the `ourai` schema.

## 2. Expose the `ourai` schema to the API

In the Supabase dashboard → **Project Settings → API → Exposed schemas**, add
`ourai` (keep the existing ones). PostgREST only serves schemas listed here.

## 3. Apply the migrations (in order)

Apply `infra/supabase/migrations/0000` … `0005`. `0000` creates the `ourai`
schema, pins `pgcrypto` to `extensions`, and grants the API roles (`anon`,
`authenticated`, `service_role`) usage + default privileges on `ourai` (row
access is still governed by RLS). The rest create the tables/policies in
`ourai`.

```bash
# with the Supabase CLI, linked to the target project:
supabase db push        # applies migrations/*.sql
# or apply each file via the SQL editor / your migration tool.
```

Nothing here targets `public`; a diff of the project's `public` schema before
and after should be identical.

## 4. Environment variables (Vercel)

From `infra/env/web.env.example`:

| Var | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser client + auth (RLS-scoped) |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Server writes (waitlist, settings) |
| `SETTINGS_ENCRYPTION_KEY` | AES-256-GCM for sensitive BYOK secrets |
| `RESEND_API_KEY` / `SUPPORT_EMAIL` / `SUPPORT_FROM` | Contact form → hidden Support inbox |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs / sitemap / OpenGraph |
| `NEXT_PUBLIC_POSTHOG_KEY` / `_HOST` | Analytics (optional) |

## 5. Enable magic-link auth

Supabase dashboard → **Authentication → Providers → Email** → enable, and add
the deploy URL to **URL Configuration → Redirect URLs**
(`https://<site>/auth/callback`).

## 6. Realtime

`ourai.events` is added to the `supabase_realtime` publication by `0002`, so the
transcript/chat live feed works once its client code lands.

## Local development

`pnpm dlx supabase start` then `supabase db reset` applies the `ourai`
migrations to the local stack. The root `docker-compose.yml` is a bare Postgres
for convenience only — the migrations reference the Supabase `auth` schema, so
use the Supabase CLI for a faithful local DB.
