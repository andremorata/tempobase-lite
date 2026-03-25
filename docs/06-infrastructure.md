# TempoBase — Infrastructure

> Deployment and environment guidance.

## 1. Environment Inventory

| Environment | Purpose | Primary Stack |
| --- | --- | --- |
| Local | Developer workflow | Next.js + PostgreSQL via Docker Compose |
| Preview | Branch / PR validation | Vercel preview + hosted PostgreSQL when configured |
| Production | Deployment target | Vercel + Neon |

## 2. Local Development Baseline

- Next.js app from `frontend/`
- PostgreSQL from root `docker-compose.yml`
- Prisma schema bootstrapped at container/app startup where configured

## 3. Infrastructure Components

| Concern | Choice | Notes |
| --- | --- | --- |
| App hosting | Vercel | Frontend and Route Handlers |
| Database | Neon PostgreSQL | Managed Postgres target |
| ORM / schema | Prisma | Active schema tool |
| Secrets | Vercel project environment variables | Runtime config |
| Local database | Docker Compose PostgreSQL | Development only |

## 4. Required Environment Variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Primary Prisma connection string |
| `DIRECT_DATABASE_URL` | Direct connection for migrations / management |
| `NEXTAUTH_SECRET` | Auth.js secret |
| `NEXTAUTH_URL` | Base URL for Auth.js |
| `NEXT_PUBLIC_API_URL` | Usually `/api` for same-origin mode |

## 5. Database Deployment Rules

- Prisma is the active schema-management path.
- Persistent environments should use Prisma migrations.
- Local ephemeral environments may use `prisma db push` for fast bootstrapping.

## 6. Deployment Guidance

Typical flow:

1. provision Neon database,
2. configure Vercel project,
3. set environment variables,
4. run Prisma migrations,
5. deploy and smoke test auth and core Route Handlers.

## 7. Verification Expectations

- Local startup should prove the app can connect to PostgreSQL.
- Deployment docs should prioritize the hosting path first.
- Infrastructure changes must stay aligned with the plan and testing strategy.

## 8. Related Documents

- [07-cicd.md](07-cicd.md) — CI/CD expectations
- [09-testing.md](09-testing.md) — Required test gates
