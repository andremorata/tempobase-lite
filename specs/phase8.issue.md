# Phase 8 — Dashboard & Insights

> Delivery plan for the TempoBase dashboard module.

## Objective

Dashboard with KPIs, charts, and quick views of recent activity. The home page after login, replacing the placeholder navigation screen with real aggregated data.

## Status: Completed

## Deliverables

| # | Deliverable | Status | Files |
|---|-------------|--------|-------|
| 8.1 | Backend `GET /api/dashboard` endpoint | ✅ Done | `Api/Endpoints/Dashboard/GetDashboardEndpoint.cs` |
| 8.2 | `IDashboardRepository` + `DashboardRepository` | ✅ Done | `Infrastructure/Persistence/Repositories/DashboardRepository.cs` |
| 8.3 | `DashboardResponse` DTOs | ✅ Done | `Application/Features/Dashboard/Dtos/DashboardDtos.cs` |
| 8.4 | Frontend dashboard types + `useDashboard` hook | ✅ Done | `lib/api/types.ts`, `lib/api/hooks/dashboard.ts` |
| 8.5 | Full dashboard page (KPIs + charts + recent entries + quick-start) | ✅ Done | `app/(app)/dashboard/page.tsx` |
| 8.6 | Backend integration tests | ✅ Done | `tests/TempoBase.Api.Tests/DashboardEndpointTests.cs` (5 tests) |
| 8.7 | Frontend unit tests | ✅ Done | `lib/api/hooks/__tests__/dashboard.test.ts` (12 tests) |
| 8.8 | E2E tests | ✅ Done | `e2e/app.spec.ts` (4 new dashboard tests) |

## Acceptance Criteria

| # | Criterion | Status |
|---|-----------|--------|
| AC-8.1 | KPIs show accurate aggregated values | ✅ TotalHoursThisWeek, TotalHoursToday, ActiveProjectsCount, BillablePercentage |
| AC-8.2 | Charts visualize data correctly | ✅ Recharts BarChart (hours per day, last 7 days) + PieChart (hours by project, this week) |
| AC-8.3 | Dashboard load time | ✅ Single endpoint call; repository uses efficient EF queries |
| AC-8.4 | Quick-start timer works | ✅ "Start timer" link navigates to `/tracker` |
| AC-8.5 | Tests pass | ✅ `dotnet test` + `pnpm test` + `pnpm test:e2e` all green |

## Implementation Notes

### Backend

- **DashboardRepository**: Single `GetDashboardAsync` method. KPIs use Monday-anchored week start. `hoursPerDay` covers last 7 days with a zero-filled array for missing dates. `hoursByProject` groups this week's entries by project, top 10. `recentEntries` is last 10 entries ordered by start time (includes running timers).
- **Endpoint**: `GET /api/dashboard` — no query parameters, always returns current-week context scoped to the authenticated account.
- **No migration needed**: no new database tables — dashboard is a pure aggregation over existing `time_entries` and `projects` tables.

### Frontend

- **KPI cards**: 4 cards — Hours this week (emerald highlight), Hours today, Active projects, Billable %.
- **Bar chart**: ResponsiveContainer + BarChart showing `hoursPerDay` for the last 7 days, with day labels.
- **Pie chart**: PieChart showing `hoursByProject` for the current week, with inline legend (top 5 projects).
- **Recent entries**: List of up to 10 entries with project color dot, description, project name, date, duration or "Running" badge.
- **Quick-start**: Prominent "Start timer" link navigating to `/tracker`.
- **Skeleton loaders**: All sections show skeleton placeholders while data loads.

### Design

- Dashboard is the landing page after login (at `/dashboard`).
- Sidebar shows "Dashboard" under the Insights group (already configured from Phase 6).
- Both light and dark themes are fully supported.
