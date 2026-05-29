# Phase 2 — Domain Layer & Database

## Objective

Implement domain models (DDD) and database schema. By the end, business entities exist with encapsulated rules and the database is ready with applied migrations.

## Dependencies

- Phase 0 (scaffolding) complete.
- Phase 1 (documentation) complete.

## Scope

### Included

- Domain base classes: `BaseEntity`, `AggregateRoot`, `ValueObject`
- Domain aggregates: `Account`, `User`, `Client`, `Project`, `ProjectTask`, `TimeEntry`, `Tag`
- Value objects: `EmailAddress`, `Slug`
- Enums: `UserRole`, `ProjectStatus`, `BillingType`
- Repository interfaces (ports) for all aggregates
- Infrastructure: `TempoBaseDbContext` with global query filters (tenant isolation, soft delete)
- EF Core entity configurations for all aggregates
- `InitialSchema` migration
- Unit tests for value objects and aggregates

### Excluded

- API endpoints
- Frontend
- Auth infrastructure (Phase 3)

## Deliverables

| #   | Deliverable                    | File/Directory                            |
| --- | ------------------------------ | ----------------------------------------- |
| 2.1 | DDD base classes               | `Domain/Common/`                          |
| 2.2 | Aggregates (Tenancy)           | `Domain/Tenancy/`                         |
| 2.3 | Aggregates (TimeTracking)      | `Domain/TimeTracking/`                    |
| 2.4 | Value objects                  | `Domain/Common/ValueObjects/`             |
| 2.5 | Repository interfaces          | `Domain/*/Repositories/`                  |
| 2.6 | DbContext + configurations     | `Infrastructure/Data/`                    |
| 2.7 | `InitialSchema` migration      | `Infrastructure/Data/Migrations/`         |
| 2.8 | Domain unit tests              | `UnitTests/Domain/`                       |

## Acceptance Criteria

| #      | Criterion                               | How To Verify                              |
| ------ | --------------------------------------- | ------------------------------------------ |
| AC-2.1 | Value objects validate inputs           | Tests: invalid input throws                |
| AC-2.2 | Aggregates encapsulate rules            | Domain unit tests pass                     |
| AC-2.3 | TimeEntry duration calculates correctly | Tests validating start/end → duration      |
| AC-2.4 | Soft delete & tenant isolation          | Global filters configured in DbContext     |
| AC-2.5 | Migration applies without errors        | `dotnet ef database update` → success      |
| AC-2.6 | Domain tests pass                       | `dotnet test` → green                      |

## Status

**Completed (validated)** — 2026-03-21

### Evidence

- 7 domain aggregates: `Account`, `User`, `Client`, `Project`, `ProjectTask`, `TimeEntry`, `Tag`
- 2 value objects: `EmailAddress`, `Slug` (with `[GeneratedRegex]`)
- 7 repository interfaces
- 8 EF Core entity configurations
- `InitialSchema` migration generated
- `dotnet build --configuration Release` → 0 warnings, 0 errors

### Notable Build Fixes Applied

- `AggregateRoot<TId>` changed to non-generic `AggregateRoot`
- `SetUpdatedAt()` added to `BaseEntity`
- `DomainUsers` DbSet renamed
- CA1716 parameter renames applied
- `[LoggerMessage]` source generation adopted
- `.editorconfig` suppression added for generated migrations
- `EF.Design` package added to API project
