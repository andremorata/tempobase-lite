# Phase 11 — Audit Log & Settings

> Delivery plan for the TempoBase audit trail and advanced settings module.

## Objective

Ship a tenant-isolated audit log with filtered browsing plus persistent workspace and user
preferences for timezone, date format, default project selection, and audit display behavior.

## Status: Completed (validated)

## Deliverables

| # | Deliverable | Status | Files |
|---|-------------|--------|-------|
| 11.1 | `AuditLog` domain entity + EF configuration + migration | ✅ Done | `Domain/Tenancy`, `Infrastructure/Data`, `Infrastructure/Data/Migrations` |
| 11.2 | Automatic audit capture for create/update/delete actions | ✅ Done | `Infrastructure/Data`, `Infrastructure/Auth`, API save paths exercised by integration tests |
| 11.3 | `GET /api/audit-logs` endpoint with filters and pagination | ✅ Done | `Api/Endpoints/Audit`, `Application/Features/Audit/Dtos` |
| 11.4 | Settings persistence for timezone, date format, default project, and audit display preferences | ✅ Done | `Domain/Tenancy`, `Api/Endpoints/Account`, `frontend/src/app/(app)/settings` |
| 11.5 | `/audit` frontend page with filters and paginated results | ✅ Done | `frontend/src/app/(app)/audit/page.tsx`, hooks/types/sidebar |
| 11.6 | Backend and frontend validation coverage | ✅ Done | `backend/tests`, `frontend/src/**/__tests__`, `frontend/e2e` |

## Acceptance Criteria

| # | Criterion | Status |
|---|-----------|--------|
| AC-11.1 | Key create/update/delete actions generate audit records | ✅ Met |
| AC-11.2 | Audit filters support period, search, and pagination | ✅ Met |
| AC-11.3 | Audit logs are tenant-isolated | ✅ Met |
| AC-11.4 | Settings persist and affect application behavior | ✅ Met |
| AC-11.5 | `dotnet test`, `pnpm test`, `pnpm test:e2e`, and `pnpm build` stay green | ✅ Met |

## Delivery Notes

- Added `AuditLog` as a tenant-scoped immutable entity with JSONB change payload storage and indexed account/action/entity/date access paths.
- Implemented `AuditLogSaveChangesInterceptor` so audit rows are captured centrally for create, update, delete, and soft-delete flows.
- Extended account and user preferences with `auditRetentionDays`, `dateFormat`, `defaultProjectId`, and `showAuditMetadata`.
- Added `GET /api/audit-logs` for owner/admin users with search, action, entity-type, date-range, and pagination filters.
- Added the `/audit` page plus sidebar navigation and wired the tracker to preselect the user's default project when the timer form is otherwise untouched.

## Validation Evidence

- `dotnet build backend/TempoBase.slnx`
- `dotnet test backend/TempoBase.slnx -v minimal`
- `pnpm --dir frontend test`
- `pnpm --dir frontend exec playwright test`
- `pnpm --dir frontend run build`

## Implementation Notes

- Audit capture should happen centrally at the persistence layer so create/update/delete flows do not need endpoint-specific logging code.
- Audit rows should denormalize actor metadata from the current authenticated user claims.
- User preferences belong to the domain user record; workspace-wide audit defaults belong to the account record.
- The tracker should consume the default project preference so the setting has immediate value in daily usage.
- The audit UI should respect the user audit-display preference when deciding whether to show detailed field changes.
