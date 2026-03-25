# Phase 0 — Project Scaffolding

## Objective

Bootstrap the repository with solution structure, tooling, and developer environment so that implementation can begin in Phase 2.

## Dependencies

- None (first phase).

## Scope

### Included
- .NET 10 solution with Clean Architecture projects.
- Next.js 16 frontend project with ShadCN/ui and Tailwind v4.
- Docker Compose for local PostgreSQL.
- Dev Container configuration.
- `.editorconfig`, `.gitignore`, `Directory.Build.props`, `Directory.Packages.props`.
- Initial EF Core DbContext with PostgreSQL connection.
- Health check endpoint (`GET /health`).
- Frontend shell (App Router layout with placeholder pages).

### Excluded
- No domain entities or business logic.
- No authentication.
- No CI/CD pipelines (Phase 12).
- No infrastructure provisioning (Phase 12).

## Tasks

- [x] Create `backend/TempoBase.sln` with four projects:
  - `TempoBase.Domain`
  - `TempoBase.Application`
  - `TempoBase.Infrastructure`
  - `TempoBase.Api`
- [x] Create `backend/tests/` with four test projects:
  - `TempoBase.Domain.Tests`
  - `TempoBase.Application.Tests`
  - `TempoBase.Infrastructure.Tests`
  - `TempoBase.Api.Tests`
- [x] Add core NuGet packages: FastEndpoints, EF Core 10, Npgsql, Serilog, Hangfire, Shouldly, xUnit, Testcontainers.
- [x] Set up `Directory.Build.props` (TreatWarningsAsErrors, Nullable enable, ImplicitUsings).
- [x] Set up `Directory.Packages.props` (central package management).
- [x] Configure `TempoBaseDbContext` with PostgreSQL connection string.
- [x] Add `GET /health` endpoint returning 200 OK.
- [x] Create `docker-compose.yml` with PostgreSQL 16 service.
- [x] Add `Dockerfile` for the API project.
- [x] Create `frontend/` with Next.js 16, React 19, TypeScript.
- [x] Install frontend dependencies: ShadCN/ui, Tailwind v4, TanStack Query, TanStack Table, react-hook-form, zod, date-fns, next-themes, recharts.
- [x] Set up App Router with `(auth)` and `(app)` route groups and placeholder pages.
- [x] Create root layout with ThemeProvider and sidebar shell.
- [x] Add `Dockerfile` for the frontend project.
- [x] Add `.editorconfig` and `.gitignore` for .NET + Node.js monorepo.
- [x] Verify `dotnet build` succeeds with zero warnings.
- [x] Verify `pnpm build` succeeds.
- [x] Verify `docker compose up` starts PostgreSQL and both apps connect.

## Acceptance Criteria

1. `dotnet build` compiles all four backend projects with zero warnings.
2. `dotnet test` runs (even if no meaningful tests yet) and reports success.
3. `pnpm build` in `frontend/` produces a production build.
4. `docker compose up` starts PostgreSQL, API, and Frontend containers.
5. `GET /health` on the API returns 200 OK.
6. Frontend renders a shell layout with sidebar navigation placeholders.
7. Repository has `.editorconfig`, `.gitignore`, `Directory.Build.props`, `Directory.Packages.props`.

## Notes

- Use .NET 10 LTS target framework.
- Use `pnpm` as the frontend package manager.
- PostgreSQL local password: `localdev` (non-production).
- Keep all packages at latest stable versions at time of scaffolding.
