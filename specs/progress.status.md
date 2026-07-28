# TempoBase Lite — Current Status

This file captures the current operating posture of the repository. It is not the task tracker; GitHub Issues are the official source for active work.

## Current Posture

- **Product state:** Production-ready full-stack time tracking app.
- **Runtime location:** `app/`.
- **Deployment target:** Vercel with Root Directory set to `app`; Neon PostgreSQL.
- **Work tracking:** GitHub Issues for active bugs, enhancements, hardening, and docs tasks.
- **Historical specs:** Completed phase files live under `specs/archive/phases/` and are not active plans.

## Recent Structural Changes

- Renamed the executable application folder from `frontend/` to `app/`.
- Added root-level pnpm scripts that delegate to `app/`.
- Replaced scaffold-style agent guidance with TempoBase Lite-specific instructions.
- Added PWA manifest and app icons for installable app support.
- Added stale timer recovery: a `time_entries.last_seen_at` heartbeat plus a prompt when a timer is found running from a previous day.
- Moved local phase issue files into the specs archive.
- Added GitHub Issue templates for bugs, features, and maintenance work.

## Validation Snapshot

Latest local checks from the repository root:

| Check | Status | Notes |
| --- | --- | --- |
| `pnpm --dir app install --frozen-lockfile` | Passed | No ignored-builds warning after `onlyBuiltDependencies` config. |
| `pnpm prisma:validate` | Passed | Prisma schema valid. |
| `pnpm lint` | Passed | Root script delegates to app lint. |
| `pnpm test` | Passed (flaky) | 133 tests. The Settings page profile-update test fails intermittently (~1 in 5 runs) independent of recent changes. |
| `pnpm build` | Passed | Against local Docker PostgreSQL. |
| `pnpm test:e2e` | Passed | 44 tests, stable across three consecutive runs. |

## Known Follow-Ups

- Triage the flaky Settings page unit test (`updates the current user profile and local auth state`).
- Run a deliberate final readiness gate after the current restructuring settles.
- Create GitHub Issues for any remaining production-hardening work that should continue beyond this cleanup.

## Notes For Agents

- Do not treat archived phase files as active scope.
- When work comes from a GitHub Issue, use that issue as the source of acceptance criteria.
- Update this file only when repository posture, validation status, or known risks materially change.
