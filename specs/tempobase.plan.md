# TempoBase — Master Implementation Plan v1

A work time tracking system with project/task management, daily time entries, automated calculations, and client-facing reports. Built as a full-stack Next.js 16 application backed by Prisma and PostgreSQL.


## Brand

- **Vibe:** Professional, reliable, and highly data-driven.

## Tech Stack (Quick Reference)

| Layer         | Technology                                                         |
| ------------- | ------------------------------------------------------------------ |
| App Runtime   | Next.js 16, React 19, Route Handlers, Server/Client Components     |
| Data Access   | Prisma 7, PostgreSQL 16, Neon adapter for serverless deployments   |
| Auth          | Auth.js v5, Credentials Provider, JWT session cookies              |
| UI            | ShadCN/ui, Tailwind v4, TanStack Query/Table, next-themes          |
| Deployment    | Vercel + Neon, Docker Compose for local dev                        |
| CI/CD         | GitHub Actions + Vercel deployment integration                     |
| Observability | App-level logging and hosting-platform telemetry for the Lite baseline |
| Dev           | Node.js 22, pnpm, Docker Compose, Prisma CLI                       |
| Tests         | Vitest, Testing Library, Playwright, PostgreSQL-backed integration tests |

### Frontend Packages

| Package               | License    | Use                                        |
| --------------------- | ---------- | ------------------------------------------ |
| next-themes           | MIT        | Theme management (dark/light/system)       |
| Vitest                | MIT        | Unit tests for components and hooks        |
| @testing-library/react | MIT       | Component rendering for tests              |
| Playwright            | Apache 2.0 | Frontend E2E tests                         |
| Recharts              | MIT        | Charts for reports module                  |
| date-fns              | MIT        | Date/time formatting and calculations      |
| react-hook-form       | MIT        | Form handling                              |
| zod                   | MIT        | Schema validation                          |

---

## Cross-Cutting Rules — Frontend Tests

Frontend tests are an integral part of the development cycle, **not a separate phase**. Every phase that produces frontend components or pages **must include** corresponding tests as deliverables:

| Type   | Tool                   | When                                        | File Convention                              |
| ------ | ---------------------- | ------------------------------------------- | -------------------------------------------- |
| Unit   | Vitest + Testing Library | Every phase with FE components/hooks        | `*.test.tsx` / `*.test.ts` next to the file  |
| E2E    | Playwright             | Every phase with complete user flows         | `frontend/e2e/*.spec.ts`                     |

### FE Test Conventions

- **Unit**: test isolated components, hooks, utilities, and formatters.
- **E2E**: test complete flows from the user's perspective (login → action → verification).
- **Naming**: test files use `.test.ts(x)` (Vitest) and `.spec.ts` (Playwright).
- **Each FE phase includes tests**: Phase 3 (auth), Phase 5 (time tracking UI), Phase 6 (reports).
- **Verification command**: `pnpm test` (Vitest) and `pnpm test:e2e` (Playwright) must pass at each phase exit gate.

## Cross-Cutting Rules — Dark Theme

TempoBase supports **dark theme** with the following rules:

- **Auto-detection**: default theme follows the browser `prefers-color-scheme`.
- **Manual switch**: user can toggle between Light, Dark, and System via a toggle component.
- **Persistence**: preference stored in `localStorage` via `next-themes`.
- **ShadCN/ui**: components already support dark mode via CSS variables — maintain theme variables in `globals.css`.
- **Implementation**: `next-themes` (MIT) with `ThemeProvider` in root layout.
- **Every new page and component must work correctly in both themes.**

## Cross-Cutting Rules — UX & Responsiveness

TempoBase frontend **must** prioritize UX and responsiveness:

- **Mobile-first**: all layouts designed from small screens up.
- **Responsive breakpoints**: Tailwind default breakpoints (sm/md/lg/xl/2xl).
- **Touch-friendly**: interactive elements sized for touch (min 44×44px touch targets).
- **Loading states**: skeleton loaders for async data, optimistic updates where appropriate.
- **Keyboard navigation**: all interactive elements reachable via keyboard.
- **Accessibility**: WCAG 2.1 AA compliance for contrast, focus indicators, and semantic HTML.

---

## User Roles (Quick Reference)

| Role         | Scope                                                              |
| ------------ | ------------------------------------------------------------------ |
| **Owner**    | Full access + billing + account deletion. One per tenant.          |
| **Admin**    | Operational management + user management. No billing.              |
| **Manager**  | View all team members' time entries + reports. No user management. |
| **Member**   | Track own time entries. View own reports.                          |
| **Viewer**   | Read-only access to reports and dashboards.                        |

---

## Core Concepts

| Concept       | Description                                                                       |
| ------------- | --------------------------------------------------------------------------------- |
| **Account**   | Tenant (organization/company). Data isolation boundary.                           |
| **User**      | Person who tracks time. Belongs to exactly one Account.                           |
| **Client**    | External client/customer the work is being done for.                              |
| **Project**   | Work container associated with a Client. Has budget and rate settings.            |
| **Task**      | Named activity category within a Project (e.g., "Development", "Code Review").    |
| **TimeEntry** | A single tracked work period: start time, end time, duration, description, date.  |
| **Tag**       | Free-form label for categorizing time entries across projects.                    |
| **Report**    | Aggregated time data with filters, grouping, and chart visualization.             |

---

# Implementation Phases

---

## Phase 0 — Development Environment & Scaffolding

### Objective

Establish the monorepo with a containerized development environment, projects compiling, and test infrastructure running. After this phase, any developer (or AI agent) opens the project and has a functional environment in a single command.

### Scope

**Included:**

- `.devcontainer/` — Dockerfile (Ubuntu 24.04 + .NET 10 + Node.js 22), docker-compose (Postgres + Azurite), devcontainer.json, post-create.sh
- Backend: .NET solution with 4 empty projects (Domain, Application, Infrastructure, Api) + 2 test projects (Unit, Integration)
- Frontend: Next.js 16 scaffold with ShadCN/ui initialized, Tailwind v4 configured
- `docker-compose.yml` (root): Postgres for local dev outside devcontainer
- `.editorconfig`, `.gitignore`, `README.md`

**Excluded:**

- Extensive business documentation (see Phase 1)
- Business logic, domain models, or functional pages
- Azure IaC, CI/CD, observability

### Deliverables

| #   | Deliverable              | File/Directory            |
| --- | ------------------------ | ------------------------- |
| 0.1 | Functional Dev Container | `.devcontainer/`          |
| 0.2 | .NET Solution compiling  | `backend/TempoBase.slnx`  |
| 0.3 | Next.js project building | `frontend/`               |
| 0.4 | Postgres accessible      | `docker-compose.yml`      |
| 0.5 | Smoke test passing       | `tests/`                  |

### Acceptance Criteria

| #      | Criterion                         | How To Verify                                                |
| ------ | --------------------------------- | ------------------------------------------------------------ |
| AC-0.1 | Dev container opens without errors | `Reopen in Container` in VS Code → terminal opens            |
| AC-0.2 | `dotnet build` passes             | `cd backend && dotnet build TempoBase.slnx` → exit 0         |
| AC-0.3 | `dotnet test` runs                | `cd backend && dotnet test` → empty tests pass               |
| AC-0.4 | `pnpm run build` in frontend      | `cd frontend && pnpm run build` → exit 0                     |
| AC-0.5 | Postgres accessible               | `psql -h localhost -U tempobase -d tempobase_dev` → connects  |

### Gate to Phase 1

✅ All AC-0.x pass. Environment is reproducible.

---

## Phase 1 — Extensive Documentation for AI Agents

### Objective

Since the project will be developed primarily by autonomous AI agents, it is crucial to have all architectural and business rule context documented in Markdown within the repository before writing code.

### Scope

**Included:**

- `/docs/01-architecture.md`: Clean Architecture, DDD, structure, directory layout.
- `/docs/02-database.md`: Data model, data dictionary, schemas (Mermaid diagrams), tenant isolation, soft delete.
- `/docs/03-api-design.md`: API contracts, FastEndpoints REPR pattern, JWT auth, RFC 7807 error handling.
- `/docs/04-frontend.md`: Next.js routing, component listing, UI/UX rules, TanStack Query state management.
- `/docs/05-business-rules.md`: Time tracking use cases, project/task workflows, permission matrix.
- `/docs/06-infrastructure.md`: Azure IaC strategy, environment topology.
- `/docs/07-cicd.md`: GitHub Actions pipeline design.
- `/docs/08-observability.md`: Logging, metrics, tracing strategy.
- `/docs/09-testing.md`: Test pyramid, tooling, conventions.
- `/docs/10-delivery-workflow.md`: Phase gating, handoff rules.
- `/docs/11-ai-agent-workflow.md`: Agent operating rules.
- `/docs/12-backend.md`: Backend patterns, endpoint conventions.

**Excluded:**

- Application source code.

### Deliverables

| #   | Deliverable             | File/Directory            |
| --- | ----------------------- | ------------------------- |
| 1.1 | Architecture Doc        | `/docs/01-architecture.md` |
| 1.2 | Database Doc            | `/docs/02-database.md`     |
| 1.3 | API Design Doc          | `/docs/03-api-design.md`   |
| 1.4 | Frontend Doc            | `/docs/04-frontend.md`     |
| 1.5 | Business Rules Doc      | `/docs/05-business-rules.md` |
| 1.6 | Infrastructure Doc      | `/docs/06-infrastructure.md` |
| 1.7 | CI/CD Doc               | `/docs/07-cicd.md`         |
| 1.8 | Observability Doc       | `/docs/08-observability.md` |
| 1.9 | Testing Doc             | `/docs/09-testing.md`      |
| 1.10 | Delivery Workflow Doc  | `/docs/10-delivery-workflow.md` |
| 1.11 | AI Agent Workflow Doc  | `/docs/11-ai-agent-workflow.md` |
| 1.12 | Backend Doc            | `/docs/12-backend.md`      |

### Acceptance Criteria

| #      | Criterion                       | How To Verify                                                      |
| ------ | ------------------------------- | ------------------------------------------------------------------ |
| AC-1.1 | All 12 docs created and filled  | Files exist in `/docs/` with project-specific content              |
| AC-1.2 | Code examples present           | Snippets showing expected patterns (endpoint, VO, entity config)   |
| AC-1.3 | Mermaid diagrams readable       | Mermaid blocks render correctly (ER, layers, state machine)        |

### Gate to Phase 2

✅ All AC-1.x pass. Documentation is available as the AI knowledge base.

---

## Phase 2 — Domain Layer & Database

### Objective

Implement domain models (DDD) and database schema. By the end, business entities exist with encapsulated rules and the database is ready with applied migrations.

### Scope

**Included:**

- Domain: `BaseEntity`, `AggregateRoot<T>`, `ValueObject`
- Domain: Aggregates (`Account`, `User`, `Client`, `Project`, `Task`, `TimeEntry`, `Tag`)
- Value Objects and Domain Events
- Enums: `UserRole`, `ProjectStatus`, `BillingType`
- Repository interfaces (ports)
- Infrastructure: `AppDbContext`, entity configs, global query filters (tenant isolation, soft delete)
- Infrastructure: Migrations (all tables)
- Seed data
- Unit tests for all VOs and aggregates

**Excluded:**

- API endpoints, frontend

### Deliverables

| #   | Deliverable                            | File/Directory                          |
| --- | -------------------------------------- | --------------------------------------- |
| 2.1 | DDD base classes                       | `Domain/Common/`                        |
| 2.2 | Complete aggregates                    | `Domain/Tenancy/`, `Domain/TimeTracking/` |
| 2.3 | Validated value objects                | `Domain/Common/ValueObjects/`           |
| 2.4 | Repository interfaces                  | `Domain/*/Repositories/`                |
| 2.5 | DbContext + Configurations             | `Infrastructure/Persistence/`           |
| 2.6 | Initial migration + Seed               | `Infrastructure/Persistence/`           |
| 2.7 | Domain unit tests                      | `UnitTests/Domain/`                     |

### Acceptance Criteria

| #      | Criterion                             | How To Verify                           |
| ------ | ------------------------------------- | --------------------------------------- |
| AC-2.1 | Value Objects validate inputs         | Tests: validation throws               |
| AC-2.2 | Aggregates encapsulate rules          | Domain tests                            |
| AC-2.3 | TimeEntry duration calculates correctly | Tests validating start/end → duration  |
| AC-2.4 | Soft delete & Tenant isolation        | Global filters configured in DbContext  |
| AC-2.5 | Migration applies without errors      | `dotnet ef database update` → success   |
| AC-2.6 | **Domain tests pass**                 | `dotnet test` → green with high coverage |

### Gate to Phase 3

✅ All AC-2.x pass. Domain layer is solid.

---

## Phase 3 — Authentication & Multi-Tenant

### Objective

Complete auth system: registration, JWT login, refresh, password recovery, 2FA, Passkeys. Multi-tenant data isolation.

### Scope

**Included:**

- Application DTOs + Validators
- Infrastructure: JwtService, Identity, EmailMock
- Api: FastEndpoints (auth endpoints)
- `TenantPreProcessor`, Global error handler, Rate limiting
- Frontend: Auth pages, API client with JWT interceptor
- Dark theme: `next-themes` + `ThemeProvider` + toggle in layout
- Unit/integration tests (BE)
- Unit tests FE (Vitest): `useAuth` hook, `AuthGuard` component
- E2E test (Playwright): login → access protected route flow

### Deliverables

| #   | Deliverable                       |
| --- | --------------------------------- |
| 3.1 | Auth endpoints                    |
| 3.2 | Password recovery & 2FA / Passkey |
| 3.3 | Tenant resolution middleware      |
| 3.4 | Frontend: auth pages              |
| 3.5 | Frontend: JWT API client          |
| 3.6 | Dark theme + ThemeProvider        |
| 3.7 | Complete auth tests (BE+FE)       |

### Acceptance Criteria

| #      | Criterion                   | How To Verify                                                 |
| ------ | --------------------------- | ------------------------------------------------------------- |
| AC-3.1 | Register and Login work     | POST returns correct tokens                                   |
| AC-3.2 | Refresh token works         | Token renewed without refresh expiration                      |
| AC-3.3 | Tenant isolated by JWT      | Request without tenant or wrong tenant intercepted            |
| AC-3.4 | Frontend flows              | Login, register, and protected route access work in Next.js   |
| AC-3.5 | Dark theme works            | Light/dark/system toggle works, preference persists           |
| AC-3.6 | **All tests pass**          | `dotnet test` + `pnpm test` + `pnpm test:e2e` → green        |

### Gate to Phase 4

✅ All AC-3.x pass. Auth is solid and frontend is functional.

---

## Phase 4 — Time Tracking: Backend

### Objective

Complete API for time tracking operations: Clients, Projects, Tasks, TimeEntries, Tags. CRUD + business rules + tenant isolation.

### Scope

**Included:**

- DTOs, endpoint handlers (FastEndpoints), concrete repositories
- Client CRUD
- Project CRUD with status management and budget tracking
- Task CRUD within Projects
- TimeEntry CRUD with timer start/stop, manual entry, duration calculation
- Tag CRUD and association with TimeEntries
- Pagination, sorting, advanced filters
- Role-based authorization (Owner, Admin, Manager, Member)
- Bulk operations: bulk delete, bulk tag time entries

### Deliverables

| #   | Deliverable                                     |
| --- | ------------------------------------------------ |
| 4.1 | Clients CRUD (5 endpoints)                       |
| 4.2 | Projects CRUD + status (6 endpoints)             |
| 4.3 | Tasks CRUD within projects (5 endpoints)         |
| 4.4 | TimeEntries CRUD + timer + manual (8 endpoints)  |
| 4.5 | Tags CRUD + association (5 endpoints)            |
| 4.6 | Bulk operations (2 endpoints)                    |

### Acceptance Criteria

| #      | Criterion                   | How To Verify                                       |
| ------ | --------------------------- | --------------------------------------------------- |
| AC-4.1 | CRUDs complete              | All modules create, read, update, and soft-delete   |
| AC-4.2 | Filters and pagination      | Query params applied to DB queries                  |
| AC-4.3 | Role authorization          | Endpoint denies users without correct Role          |
| AC-4.4 | Tenant isolation guaranteed | DB test with isolated tenant passes                 |
| AC-4.5 | Timer start/stop works      | Running timer returns current duration              |
| AC-4.6 | Duration auto-calculated    | Start + End → correct duration in hours/decimal     |

### Gate to Phase 5

✅ All AC-4.x pass. API is complete.

---

## Phase 5 — Time Tracking: Frontend

### Objective

App pages in the UI: layout, timesheet view, time tracker view, project/client management, with focus on UX and responsiveness.

### Scope

**Included:**

- Layout (Sidebar/Header) with responsive navigation
- **Timesheet page** — Weekly grid view (projects × days) with daily totals, matching a standard weekly timesheet UI pattern
- **Time Tracker page** — Timer-based tracking with start/stop, description, project/task selection, and daily list of entries (standard live tracker UI pattern)
- Clients management page
- Projects management page with task administration
- Tags management page
- Time entry quick-edit inline
- Responsive design for all screens
- Keyboard shortcuts for common actions (start/stop timer, save entry)
- Components base (DataTable, Inputs, badges, duration pickers)
- Unit tests (Vitest) for shared components and hooks
- E2E tests (Playwright) for complete time tracking flows

### Acceptance Criteria

| #      | Criterion                       | How To Verify                                      |
| ------ | ------------------------------- | -------------------------------------------------- |
| AC-5.1 | Authenticated routes restricted | Anonymous users redirected correctly               |
| AC-5.2 | Timesheet view works            | Weekly grid with project rows and day columns      |
| AC-5.3 | Timer tracking works            | Start/stop timer with live duration display        |
| AC-5.4 | Manual entry works              | Add time entry with start/end or duration          |
| AC-5.5 | Project/Client management       | CRUD operations via UI                             |
| AC-5.6 | Responsive layout               | Works on mobile, tablet, and desktop breakpoints   |
| AC-5.7 | Unit tests FE pass              | `pnpm test` → green (shared components, hooks)     |
| AC-5.8 | E2E tests pass                  | `pnpm test:e2e` → green (time tracking flows)      |

### Gate to Phase 6

✅ All AC-5.x pass. UI is interactive and communicating with BE.

---

## Phase 6 — Reports & Analytics

### Objective

Deliver the report builder module with summary, detailed, and weekly report views. Charts for data visualization and export capabilities for client sharing.

### Scope

**Included:**

- Backend: report aggregation endpoints with filters (date range, project, client, task, user, tag)
- **Summary Report** — Grouped totals by project, client, task, or user with bar/pie charts
- **Detailed Report** — Individual time entry listing with filters, sortable, and inline duration display
- **Weekly Report** — Week-by-week breakdown with day columns and totals
- Export: PDF and CSV export of report data
- Shareable reports: public link with optional expiration for client access
- Date range presets (This week, Last week, This month, Custom range)
- Recharts integration for bar charts, pie charts, and summary visualizations
- Filters: Client, Project, Task, User, Tag, Billable/Non-billable, Date range

### Deliverables

| #   | Deliverable                                     |
| --- | ------------------------------------------------ |
| 6.1 | Summary report endpoint + page                   |
| 6.2 | Detailed report endpoint + page                  |
| 6.3 | Weekly report endpoint + page                    |
| 6.4 | Charts integration (Recharts)                    |
| 6.5 | Export (PDF + CSV)                               |
| 6.6 | Shareable report links                           |

### Acceptance Criteria

| #      | Criterion                              | How To Verify                                              |
| ------ | -------------------------------------- | ---------------------------------------------------------- |
| AC-6.1 | Summary report with grouping           | Group by project/client/task/user returns correct totals   |
| AC-6.2 | Detailed report with filters           | Filter by date range + project returns matching entries     |
| AC-6.3 | Weekly report shows day breakdown      | Columns per weekday with correct hour totals               |
| AC-6.4 | Charts render correctly                | Recharts bar/pie charts display report data                |
| AC-6.5 | Export generates valid files            | CSV and PDF downloads contain correct report data          |
| AC-6.6 | Shared link works                      | Public URL shows report without authentication             |
| AC-6.7 | **Tests pass**                         | `dotnet test` + `pnpm test` + `pnpm test:e2e` → green     |

### Gate to Phase 7

✅ All AC-6.x pass. Reports module is complete.

---

## Phase 7 — CSV Data Import

### Objective

Import time tracking data from external CSV exports via upload with column mapping and preview review.

### Scope

**Included:**

- Backend: CSV parser with auto-matching of project/client/task/user
- Backend: endpoints `POST /api/imports/time-entries/parse` and `POST /api/imports/time-entries/execute`
- Frontend: `/imports` page with upload, column mapping, and editable review grid
- Support for a detailed time-report CSV format (as the primary import source)
- Validation and error reporting per row

### Acceptance Criteria

| #      | Criterion                                              | How To Verify                                                                     |
| ------ | ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| AC-7.1 | CSV is pre-processed with preview and per-row validation | `POST /imports/time-entries/parse` returns rows, suggestions, and per-row errors  |
| AC-7.2 | User reviews and corrects mappings before importing     | UI allows adjusting project/client/task and include/exclude rows                  |
| AC-7.3 | Execution creates consistent time entries               | `POST /imports/time-entries/execute` creates entries and returns summary + errors  |
| AC-7.4 | Detailed time-report CSV format supported               | Sample CSV from attachment imports correctly                                       |
| AC-7.5 | **Tests pass**                                          | `dotnet test` + `pnpm test` + `pnpm test:e2e` → green                            |

### Gate to Phase 8

✅ All AC-7.x pass. Data import is operational.

---

## Phase 8 — Dashboard & Insights

### Objective

Dashboard with KPIs, charts, and quick views of recent activity. The home page after login.

### Scope

**Included:**

- Backend: `GET /api/dashboard` endpoint with aggregated metrics
- Frontend `/` with KPIs (total hours this week, hours today, active projects, billable %)
- Recharts: hours per day bar chart, hours by project pie chart
- Recent time entries list
- Quick-start timer from dashboard
- Period filters (This week, Last week, This month)

### Acceptance Criteria

| #      | Criterion                              | How To Verify                                            |
| ------ | -------------------------------------- | -------------------------------------------------------- |
| AC-8.1 | KPIs show accurate aggregated values   | Compare sum with DB                                      |
| AC-8.2 | Charts visualize data correctly        | Recharts renders chart with real data                    |
| AC-8.3 | Dashboard load time                    | Endpoint resolves in < 500ms                             |
| AC-8.4 | Quick-start timer works                | Start timer from dashboard → navigates to tracker        |
| AC-8.5 | **Tests pass**                         | `dotnet test` + `pnpm test` + `pnpm test:e2e` → green   |

### Gate to Phase 9

✅ All AC-8.x pass. Dashboard is functional and performant.

---

## Phase 9 — Billing & Rates

### Objective

Support billable/non-billable time entries with hourly rates at project and task level. Invoice-ready time summaries.

### Scope

**Included:**

- Domain: `BillingType` enum (Billable, Non-billable), `HourlyRate` on Project and Task
- Backend: rate calculations in report endpoints, billable time filtering
- Frontend: billable toggle on time entries, rate configuration in project settings
- Reports: billable amount columns and totals
- Invoice data export (not full invoicing — just data for external tools)

### Acceptance Criteria

| #      | Criterion                              | How To Verify                                            |
| ------ | -------------------------------------- | -------------------------------------------------------- |
| AC-9.1 | Billable flag persists on time entries | Toggle billable → saved and reflected in reports         |
| AC-9.2 | Rates calculate correctly              | Hours × rate = correct amount in reports                 |
| AC-9.3 | Invoice export contains rate data      | CSV/PDF export includes billable hours and amounts       |
| AC-9.4 | **Tests pass**                         | `dotnet test` + `pnpm test` + `pnpm test:e2e` → green   |

### Gate to Phase 10

✅ All AC-9.x pass. Billing and rates operational.

---

## Phase 10 — Team & User Management

### Objective

Multi-user support within a tenant. Invite users, manage roles, view team time entries, and
introduce the shared settings surface for workspace and profile management.

### Scope

**Included:**

- Backend/frontend foundation for `/settings`
- Account settings: workspace name, timezone, currency
- User profile settings and password change
- Backend: user invitation flow (email invite → registration)
- Backend: role management (Owner, Admin, Manager, Member, Viewer)
- Frontend: Team management page, user role editing
- Manager view: see all team members' time entries and reports
- Activity feed: recent team activity

### Acceptance Criteria

| #       | Criterion                              | How To Verify                                             |
| ------- | -------------------------------------- | --------------------------------------------------------- |
| AC-10.0 | Settings foundation works              | `/settings` loads and account/profile updates persist     |
| AC-10.1 | Invite user via email                  | Invited user receives link and can register               |
| AC-10.2 | Role-based access enforced             | Member cannot see others' entries; Manager can            |
| AC-10.3 | Team activity visible to managers      | Manager dashboard shows team-level KPIs                   |
| AC-10.4 | **Tests pass**                         | `dotnet test` + `pnpm test` + `pnpm test:e2e` → green    |

### Gate to Phase 11

✅ All AC-10.x pass. Team management complete.

---

## Phase 11 — Audit Log & Settings

### Objective

System audit trail, account settings, and user preferences.

### Scope

**Included:**

- Domain: `AuditLog` entity with denormalized user info
- Infrastructure: audit logging integrated at key action points
- API: paginated listing endpoint with filters
- Frontend: Audit log page with filters
- Additional settings: date format, default project, and audit-facing preferences

### Acceptance Criteria

| #       | Criterion                              | How To Verify                                             |
| ------- | -------------------------------------- | --------------------------------------------------------- |
| AC-11.1 | Key actions logged                     | Create/edit/delete generates audit record                 |
| AC-11.2 | Filters work                           | Period, search, and pagination correct                    |
| AC-11.3 | Tenant isolation                       | Logs separated by tenant                                  |
| AC-11.4 | Settings persist                       | Change timezone → reflected across application            |
| AC-11.5 | **Tests pass**                         | `dotnet test` + `pnpm test` + `pnpm test:e2e` → green    |

### Gate to Phase 12

✅ All AC-11.x pass. Audit and settings complete.

---

## Phase 12 — Branch Alignment & Cleanup

### Objective

Remove the legacy .NET backend and Azure infrastructure. Align all docs and specs to treat the Next.js application as the only system. Establish the Vercel + Neon deployment path.

### Deliverables

| #    | Deliverable                                  |
| ---- | -------------------------------------------- |
| 12.1 | Align docs and specs                         |
| 12.2 | Remove backend/, infra/, and CI/CD workflows |
| 12.3 | Update README and deployment guidance        |

### Acceptance Criteria

| #       | Criterion                                    | How To Verify                                    |
| ------- | -------------------------------------------- | ------------------------------------------------ |
| AC-12.1 | Docs identify Next.js/Prisma/Auth.js as arch | All docs consistent                              |
| AC-12.2 | Legacy directories removed                   | `backend/`, `infra/`, `.github/workflows/` gone  |
| AC-12.3 | No orphaned legacy references in docs        | Grep for .NET/Azure/backend references           |

### Gate to Phase 13

✅ All AC-12.x pass. Repository is a clean single-stack application.

---

## Phase 13 — Production Hardening

### Objective

Security audit, performance optimization, production readiness checklist.

### Scope

**Included:**

- Security review: OWASP Top 10 check
- Performance: query optimization, caching strategy, CDN for frontend
- Rate limiting and abuse prevention
- Backup and disaster recovery validation
- Health check endpoints
- Documentation for ops runbook
- Final E2E regression suite

### Acceptance Criteria

| #       | Criterion                              | How To Verify                                             |
| ------- | -------------------------------------- | --------------------------------------------------------- |
| AC-13.1 | No critical/high security findings     | OWASP checklist passes                                    |
| AC-13.2 | Core flows under 500ms latency         | Load test results                                         |
| AC-13.3 | Health endpoints respond               | `/health` returns 200                                     |
| AC-13.4 | Backup/restore validated               | Restore from backup → data integrity check                |
| AC-13.5 | **All tests pass**                     | Full suite green                                          |

### Final Gate

✅ All AC-13.x pass. System is production-ready.
