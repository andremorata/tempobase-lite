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
- Moved local phase issue files into the specs archive.
- Added GitHub Issue templates for bugs, features, and maintenance work.

## Validation Snapshot

Latest local checks from the repository root:

| Check | Status | Notes |
| --- | --- | --- |
| `pnpm --dir app install --frozen-lockfile` | Passed | No ignored-builds warning after `onlyBuiltDependencies` config. |
| `pnpm prisma:validate` | Passed | Prisma schema valid. |
| `pnpm lint` | Passed | Root script delegates to app lint. |
| `pnpm test` | Failing | One existing Settings page test cannot find the `DD/MM/YYYY` option. |
| `pnpm build` | Not rerun in this pass | Runs `prisma migrate deploy`; requires intentional DB/migration context. |
| `pnpm test:e2e` | Not rerun in this pass | Should be run before release readiness claims. |

## Known Follow-Ups

- Triage the failing Settings page unit test.
- Run a deliberate final readiness gate after the current restructuring settles.
- Create GitHub Issues for any remaining production-hardening work that should continue beyond this cleanup.

## Notes For Agents

- Do not treat archived phase files as active scope.
- When work comes from a GitHub Issue, use that issue as the source of acceptance criteria.
- Update this file only when repository posture, validation status, or known risks materially change.
