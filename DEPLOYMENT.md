# TempoBase Deployment Guide

Deploy TempoBase with Vercel for the app runtime and Neon for PostgreSQL.

## Prerequisites

- GitHub account
- Vercel account
- Neon account
- Node.js 22+
- pnpm

## Architecture

- App runtime: Next.js 16 on Vercel
- API runtime: Route Handlers in the same Next.js app
- Database: Neon PostgreSQL
- ORM: Prisma
- Auth: Auth.js v5

## 1. Create The Neon Database

1. Create a Neon project.
2. Choose PostgreSQL 16.
3. Copy both connection strings:
   - `DATABASE_URL`: pooled runtime connection
   - `DIRECT_DATABASE_URL`: direct migration connection
4. Enable pooled connections for runtime usage if Neon exposes that option separately.

## 2. Configure Local Environment

Create `frontend/.env.local` with values like:

```env
DATABASE_URL="postgresql://user:password@host/db?sslmode=require&pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
NEXTAUTH_SECRET="replace-with-a-strong-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="/api"
```

Notes:

- `NEXT_PUBLIC_API_URL` should stay `/api` for same-origin mode.
- `DATABASE_URL` is for runtime queries.
- `DIRECT_DATABASE_URL` is for Prisma migrations and direct database management.

## 3. Install And Initialize

```bash
cd frontend
pnpm install
pnpm exec prisma generate
pnpm exec prisma migrate deploy
```

Optional seed:

```bash
pnpm exec prisma db seed
```

## 4. Verify Locally

```bash
cd frontend
pnpm dev
```

Validate at least:

- app loads at `http://localhost:3000`
- registration flow works
- login flow works
- protected routes honor the Auth.js session
- database-backed reads and writes succeed

## 5. Deploy To Vercel

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Set the project root to `frontend`.
4. The default build command (`pnpm run build`) already handles Prisma generation, migration deployment, and the Next.js build. No custom build command override is needed.

5. Configure these environment variables in Vercel:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Runtime pooled database connection |
| `DIRECT_DATABASE_URL` | Direct migration connection |
| `NEXTAUTH_SECRET` | Auth.js secret |
| `NEXTAUTH_URL` | Production app URL |
| `NEXT_PUBLIC_API_URL` | `/api` |

## 6. Baseline The Existing Production Database

Since the production database already has the schema (applied via `prisma db push`), you must mark the initial migration as already applied. Run this once, using Neon credentials:

```bash
cd frontend
DIRECT_DATABASE_URL="postgresql://user:password@host/db?sslmode=require" pnpm exec prisma migrate resolve --applied 20260324000000_init
```

This tells Prisma "this migration is already reflected in the database — don't run it again." After this, all future migrations will apply automatically during Vercel builds.

## 7. Smoke Check Production

Validate at least:

- home page loads
- register/login/logout works
- session persists correctly
- one protected Route Handler works end to end
- core CRUD flow can read and write data

## Cost Notes

The intended target is a low-cost or zero-cost-friendly baseline:

- Vercel Hobby for the app runtime where acceptable
- Neon free tier for small evaluation or personal usage

Exact limits can change over time, so confirm current provider quotas before relying on a zero-cost plan for shared production use.

## Troubleshooting

### Prisma client missing during build

Use a build command that runs Prisma client generation before `next build`.

### Database connection failures

- verify `DATABASE_URL` and `DIRECT_DATABASE_URL`
- verify SSL settings required by Neon
- verify pooled runtime connection usage

### Auth session issues

- verify `NEXTAUTH_SECRET`
- verify `NEXTAUTH_URL`
- verify the frontend is using same-origin `/api`
- verify the Auth.js callbacks expose the expected tenant/user data
