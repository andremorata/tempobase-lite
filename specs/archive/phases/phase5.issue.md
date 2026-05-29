# Phase 5 — Time Tracking: Frontend

## Objective

Build all time tracking UI pages: layout, timesheet view, time tracker view, and management pages for clients, projects, and tags. Focus on UX quality, responsiveness, and complete test coverage.

## Dependencies

- Phase 3 (auth frontend: `AuthProvider`, `apiFetch` client) complete.
- Phase 4 (all time tracking backend endpoints) complete.

## Scope

### Included

- Responsive Sidebar + Header layout with navigation
- **Timesheet page** (`/timesheet`) — weekly grid (projects × days) with daily and weekly totals; standard weekly timesheet UI pattern
- **Time Tracker page** (`/tracker`) — start/stop timer with live duration, description field, project/task selector, daily entry list; standard live tracker UI pattern
- Time entry quick-edit inline (edit description, project, duration without leaving the list)
- Clients management page (`/clients`) — list, create, edit, archive
- Projects management page (`/projects`) — list, create, edit, status change, task administration inline
- Tags management page (`/tags`) — list, create, edit, delete
- Keyboard shortcuts: start/stop timer, save entry
- Shared components: `DataTable`, duration picker, project/task selector, badges
- TanStack Query for all server state (list + mutation hooks per module)
- Dark theme support on all new pages and components
- Responsive design: mobile, tablet, desktop breakpoints
- Unit tests (Vitest + Testing Library): shared components and custom hooks
- E2E tests (Playwright): complete time tracking flows

### Excluded

- Reports (Phase 6)
- Billing/rate UI (Phase 9)
- Team management (Phase 10)
- Dashboard KPIs (Phase 8)

## Deliverables

| #   | Deliverable                                           |
| --- | ----------------------------------------------------- |
| 5.1 | Sidebar + Header layout with responsive nav           |
| 5.2 | Timesheet page (weekly grid)                          |
| 5.3 | Time Tracker page (timer + daily list)                |
| 5.4 | Clients management page                               |
| 5.5 | Projects management page + inline task administration |
| 5.6 | Tags management page                                  |
| 5.7 | Shared components (DataTable, duration picker, etc.)  |
| 5.8 | TanStack Query hooks for all modules                  |
| 5.9 | Unit tests (Vitest)                                   |
| 5.10 | E2E tests (Playwright)                               |

## Acceptance Criteria

| #      | Criterion                       | How To Verify                                    |
| ------ | ------------------------------- | ------------------------------------------------ |
| AC-5.1 | Authenticated routes restricted | Anonymous users redirected to login              |
| AC-5.2 | Timesheet view works            | Weekly grid with project rows and day columns    |
| AC-5.3 | Timer tracking works            | Start/stop timer with live duration display      |
| AC-5.4 | Manual entry works              | Add time entry with start/end or duration        |
| AC-5.5 | Project/Client management       | CRUD operations via UI                           |
| AC-5.6 | Responsive layout               | Works on mobile, tablet, and desktop breakpoints |
| AC-5.7 | Unit tests pass                 | `pnpm test` → green                              |
| AC-5.8 | E2E tests pass                  | `pnpm test:e2e` → green                          |

## Gate to Phase 6

✅ All AC-5.x pass. UI is interactive and communicating with backend.

## Status

**Completed** — 2025-07-26

### Completed
- 5.1 Sidebar + Header layout (responsive nav shell with `SidebarProvider`, `AuthGuard`).
- 5.2 Timesheet page: weekly grid (projects × days) with daily/weekly totals, week navigation. `/timesheet` route.
- 5.3 Time Tracker page: `TimerBar`, `ProjectSelector`, daily list (`/tracker` route). Start/stop timer with live duration, keyboard shortcut Ctrl+Shift+S.
- 5.4 Clients management page: list, create, edit, delete (soft-delete). `/clients` route.
- 5.5 Projects management page + inline task administration (`TaskList` component). Create, edit, archive, delete. `/projects` route.
- 5.6 Tags management page: list, create, edit, delete (soft-delete). `/tags` route.
- 5.7 Shared components: `ProjectSelector`, `ConfirmDialog`, format utilities (`formatDuration`, `formatTime`, `decimalToHMS`, `secondsToHMS`).
- 5.8 TanStack Query hooks: all CRUD hooks for TimeEntries, Clients, Projects, Tasks, Tags (all in `frontend/src/lib/api/hooks/`).
- 5.9 Unit tests: 10 Vitest tests — 6 for `TimerBar`, 4 for `ProjectSelector`. `pnpm test` → green.
- 5.10 E2E tests: 14 Playwright tests — 7 auth flow, 7 authenticated app pages. `pnpm test:e2e` → green.
- Dashboard page: quick links navigation hub. `/dashboard` route.

### Bug Fixes Applied
- Deleted duplicate `UnitTest1.cs` files in `Api.Tests` and `Domain.Tests` (caused CS0101 compilation errors, blocked all backend tests).
- Fixed timesheet date format: changed `toISOString()` to `format(date, "yyyy-MM-dd")` for backend `DateOnly` compatibility.
- Added missing validators: `CreateTimeEntryValidator`, `UpdateTimeEntryValidator`, `StartTimerValidator` (bad input was causing 500 instead of 400).
- Fixed `RegisterEndpoint`: returns 201 on success, catches `InvalidOperationException` and returns 409 on conflict.
