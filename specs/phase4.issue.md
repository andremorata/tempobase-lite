# Phase 4 — Time Tracking: Backend

## Objective

Complete API for all time tracking operations: Clients, Projects, Tasks, TimeEntries, Tags. CRUD + business rules + tenant isolation enforced on every endpoint.

## Dependencies

- Phase 2 (domain layer) complete.
- Phase 3 (auth + `ICurrentUserService`) complete.

## Scope

### Included

- Application DTOs for all modules
- FastEndpoints endpoint handlers for all modules
- Concrete EF Core repository implementations
- Client CRUD (5 endpoints)
- Project CRUD with status management (6 endpoints)
- Task CRUD within Projects (5 endpoints)
- TimeEntry CRUD + Start/Stop timer + manual entry + duration auto-calculation (8 endpoints)
- Tag CRUD + association with TimeEntries (5 endpoints)
- Bulk delete TimeEntries (1 endpoint)
- Bulk tag TimeEntries (1 endpoint)
- Pagination, sorting, and filtering on all list endpoints
- Role-based authorization via `[Authorize]` / policy checks
- Tenant isolation via `ICurrentUserService` on every endpoint

### Excluded

- Frontend pages (Phase 5)
- Reports and analytics (Phase 6)
- Billing/rate calculations (Phase 9)

## Deliverables

| #   | Deliverable                                     |
| --- | ------------------------------------------------ |
| 4.1 | Clients CRUD (5 endpoints)                       |
| 4.2 | Projects CRUD + status (6 endpoints)             |
| 4.3 | Tasks CRUD within projects (5 endpoints)         |
| 4.4 | TimeEntries CRUD + timer + manual (8 endpoints)  |
| 4.5 | Tags CRUD + association (5 endpoints)            |
| 4.6 | Bulk operations (BulkDelete + BulkTag)           |
| 4.7 | Concrete repository implementations              |

## Acceptance Criteria

| #      | Criterion                   | How To Verify                                     |
| ------ | --------------------------- | ------------------------------------------------- |
| AC-4.1 | CRUDs complete              | All modules create, read, update, and soft-delete |
| AC-4.2 | Filters and pagination      | Query params applied to DB queries                |
| AC-4.3 | Role authorization          | Endpoint denies users without correct role        |
| AC-4.4 | Tenant isolation guaranteed | Data scoped to current user's account             |
| AC-4.5 | Timer start/stop works      | Running timer returns current duration            |
| AC-4.6 | Duration auto-calculated    | Start + End → correct duration in hours/decimal   |
| AC-4.7 | `dotnet build` clean        | 0 warnings, 0 errors                              |

## Status

**Completed (validated)** — 2026-03-21

### Evidence

- 29 FastEndpoints total:
  - 5 Clients endpoints
  - 6 Projects endpoints
  - 5 Tasks endpoints
  - 8 TimeEntries endpoints (incl. Start/Stop timer + BulkDelete)
  - 5 Tags endpoints
- All endpoints use `ICurrentUserService` for multi-tenant scoping
- `dotnet build --configuration Release` → 0 warnings, 0 errors

### Key Directories

- `Api/Endpoints/{Clients,Projects,Tasks,TimeEntries,Tags}/`
- `Application/Features/**/Dtos/`
- `Infrastructure/Persistence/Repositories/`
- `Infrastructure/DependencyInjection.cs`
