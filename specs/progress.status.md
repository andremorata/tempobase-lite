# TempoBase — Progress Tracker

> Source of truth for delivery status across all phases.

## Current Snapshot

- **Active phase:** Phase 13 — Production Hardening
- **Overall status:** Legacy backend and Azure infrastructure removed; repository is a clean single-stack Next.js application. All docs and specs updated.
- **Last updated:** 2026-03-24
- **Primary risks:** Browser-level auth-flow validation could be broader. Integration test coverage for Route Handlers can be expanded.

## Phase Board

| Phase | Scope                      | Status              | Last Updated | Evidence / Notes                                             | Next Action                    |
| ----- | -------------------------- | ------------------- | ------------ | ------------------------------------------------------------ | ------------------------------ |
| 0     | Project Scaffolding        | Completed (validated)| 2026-03-21   | `pnpm build` success; `docker compose up` containers healthy | —                              |
| 1     | Documentation              | Completed (validated)| 2025-01-20   | All docs updated, phase issues created, README updated    | —                              |
| 2     | Domain Layer & Database    | Completed (validated)| 2026-03-21   | Prisma schema with all domain models; migrations applied | —                              |
| 3     | Auth & Multi-tenant        | Completed (validated)| 2026-03-21   | Auth.js v5 credentials auth; session cookies; login + register pages | —                              |
| 4     | Time Tracking Backend      | Completed (validated)| 2026-03-21   | Route Handlers for Clients, Projects, Tasks, TimeEntries, Tags | —                              |
| 5     | Time Tracking Frontend     | Completed (validated)| 2025-07-26   | All pages: tracker, timesheet, clients, projects, tags, dashboard; unit + E2E tests passing | —                              |
| 6     | Reports & Analytics        | Completed (validated)| 2026-03-23   | Summary/Detailed/Weekly reports; Recharts charts; CSV/PDF export; shared reports | —                              |
| 7     | CSV Data Import            | Completed (validated)| 2026-03-22   | Import endpoints; CSV parser; frontend upload + preview; tests green | —                              |
| 8     | Dashboard & Insights       | Completed (validated)| 2026-03-22   | Dashboard endpoint; KPI cards, charts, recent entries; tests green | —                             |
| 9     | Billing & Rates            | Completed (validated)| 2026-03-23   | Rate resolution, billing in reports/exports, task rate editing; tests green | —                              |
| 10    | Team & User Management     | Completed (validated)| 2026-03-23   | Account settings, team admin, invites, data governance; tests green | —                              |
| 11    | Audit Log & Settings       | Completed (validated)| 2026-03-23   | Audit entity + interceptor; audit page; settings expanded; tests green | —                              |
| 12    | Branch Alignment & Cleanup | Completed (validated)| 2026-03-24   | Legacy backend, Azure infra, and CI/CD workflows removed. All docs and specs cleaned up. Repository is a single-stack Next.js application. | —                              |
| 13    | Production Hardening       | Not started          |              |                                                              | Awaiting planning              |

## Validation Notes

### Phase 12 — Branch Alignment & Cleanup (Completed)
- **Date:** 2026-03-24
- **Evidence:** `backend/` directory removed. `infra/` directory removed. All `.github/workflows/` removed. `docs/12-backend.md` removed. All 11 remaining docs rewritten to remove legacy backend/Azure/branch-mode/parity language. Specs updated. README updated. AGENTS.md updated.
- **Files removed:** `backend/` (entire directory), `infra/` (Bicep modules and deploy scripts), `.github/workflows/ci.yml`, `.github/workflows/deploy-dev.yml`, `.github/workflows/deploy-staging.yml`, `.github/workflows/deploy-prod.yml`, `docs/12-backend.md`.
- **Files updated:** All `docs/*.md`, `specs/tempobase.plan.md`, `specs/phase12.issue.md`, `specs/progress.status.md`, `AGENTS.md`, `README.md`.

## Evidence Log

- 2026-03-25: Shared report amount-visibility UX fix completed. In the public shared report page, the top `Billed Amount` KPI card now renders only when `showAmounts` is enabled, for both Summary and Detailed report types, preventing misleading amount display when amounts are intentionally hidden.

- 2026-03-25: Reports save/share compatibility fix completed. Saved/shared report APIs now normalize legacy title-case `groupBy` payloads (`Project`, `Client`, `Task`) to persisted lowercase values, and the summary endpoint now accepts either form. Added frontend regression coverage for the normalization helpers.

- 2026-03-24: Legacy backend and Azure infrastructure fully removed. Repository cleaned to single-stack Next.js application. All docs, specs, README, and AGENTS.md updated to remove legacy references. `backend/`, `infra/`, `.github/workflows/`, and `docs/12-backend.md` deleted.

- 2026-03-24: Frontend Auth.js client cutover completed. Added a root `SessionProvider` composition layer, migrated `useAuth()` internals from localStorage/JWT handling to Auth.js credentials sign-in and sign-out flows, switched the shared API client and import uploads to same-origin cookie-based requests, and corrected invite registration to use `/api/auth/register-invite`. Validation: no diagnostics in touched files, targeted auth regression tests were added for login, registration, and `AuthGuard` behavior, `pnpm --dir frontend test` passed 73/73, and `pnpm --dir frontend run build` succeeded.

- 2026-03-24: Documentation cleanup completed. Rewrote `docs/05-business-rules.md` and `docs/08-observability.md`, replaced `DEPLOYMENT.md` with a deployment guide, and replaced `frontend/README.md` boilerplate with application guidance.

- 2026-03-24: Documentation realignment completed. Updated the master plan, Phase 12 issue, progress tracker, README, deployment docs, and core architecture/API/testing/agent workflow docs.

- 2026-03-23: Phase 12 dev environment setup. Replaced auto-deploy on staging with a minimal dev environment. Created `deploy-dev.yml`.

- 2026-03-23: Phase 11 Audit Log & Settings completed. Added `AuditLog` entity, migration, audit page, extended settings. Validation: frontend unit tests 66/66, Playwright 35/35, build green.

- 2026-03-23: Phase 10 Team & User Management completed. Account settings, team administration, invites, data governance, export/purge. Validation: frontend unit tests, E2E tests, build green.

- 2026-03-23: Phase 9 Billing & Rates completed. Rate resolution, billing in reports/exports, task rate editing. Tests green.

- 2026-03-22: Phase 7 CSV Data Import completed. Import endpoints, CSV parser, frontend upload + preview. Tests green.

- 2026-03-22: Phase 8 Dashboard & Insights completed. Dashboard endpoint, KPI cards, charts, recent entries. Tests green.

- 2026-03-22: Phase 6 Reports & Analytics completed. Summary/Detailed/Weekly reports, Recharts charts, CSV/PDF export, shared reports. Tests green.

- 2025-07-26: Phase 5 Time Tracking Frontend completed. All pages built: tracker, timesheet, clients, projects, tags, dashboard. Unit + E2E tests passing.
