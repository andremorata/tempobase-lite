# TempoBase — CI/CD Pipeline

> Continuous integration and deployment guidance.

## 1. Core Pipeline Goals

- Fast feedback for frontend and Route Handler changes
- Stable automated test gates
- Deployment path that matches the Vercel + Neon runtime model

## 2. CI Gates

| Gate | Purpose |
| --- | --- |
| Install | Ensure reproducible dependency resolution |
| Lint | Catch style and obvious correctness issues |
| Build | Verify Next.js production build |
| Unit tests | Validate pure logic, helpers, hooks, and components |
| Integration tests | Validate Route Handlers + Prisma + PostgreSQL behavior |
| E2E smoke | Validate critical user journeys where appropriate |

## 3. Suggested Commands

| Area | Command |
| --- | --- |
| Install | `pnpm --dir frontend install --frozen-lockfile` |
| Lint | `pnpm --dir frontend lint` |
| Build | `pnpm --dir frontend run build` |
| Unit/UI tests | `pnpm --dir frontend test` |
| E2E tests | `pnpm --dir frontend test:e2e` |
| Prisma generate | `pnpm --dir frontend exec prisma generate` |

## 4. Deployment Expectations

The deployment path should document:

1. environment variable setup,
2. database migration execution,
3. deployment trigger,
4. smoke validation for auth and core flows,
5. rollback considerations.

## 5. Related Documents

- [06-infrastructure.md](06-infrastructure.md) — Deployment target and environment rules
- [09-testing.md](09-testing.md) — Required test strategy
- [specs/progress.status.md](../specs/progress.status.md) — Status and validation evidence
