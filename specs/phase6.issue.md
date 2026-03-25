# Phase 6 — Reports & Analytics

> Delivery plan for the TempoBase report builder module.

## Objective

Deliver the report builder module with summary, detailed, and weekly report views. Charts for data visualization, CSV/PDF export, and shareable report links.

## Status: Completed

## Deliverables

| # | Deliverable | Status | Files |
|---|-------------|--------|-------|
| 6.1 | Summary report endpoint + page | ✅ Done | `Api/Endpoints/Reports/SummaryReportEndpoint.cs`, `app/(app)/reports/page.tsx` |
| 6.2 | Detailed report endpoint + page | ✅ Done | `Api/Endpoints/Reports/DetailedReportEndpoint.cs`, `app/(app)/reports/page.tsx` |
| 6.3 | Weekly report endpoint + page | ✅ Done | `Api/Endpoints/Reports/WeeklyReportEndpoint.cs`, `app/(app)/reports/page.tsx` |
| 6.4 | Charts integration (Recharts) | ✅ Done | Bar chart + Pie chart in Summary tab; Bar chart in Weekly tab |
| 6.5 | Export (CSV + PDF/Print) | ✅ Done | Client-side CSV generation per tab; `window.print()` for PDF |
| 6.6 | Shareable report links | ✅ Done | `CreateSharedReportEndpoint.cs`, `GetPublicSharedReportEndpoint.cs`, `ListSharedReportsEndpoint.cs`, `DeleteSharedReportEndpoint.cs`, `SharedReport` entity |

## Acceptance Criteria

| # | Criterion | Status |
|---|-----------|--------|
| AC-6.1 | Summary report with grouping | ✅ Group by Project/Client/Task, returns correct totals |
| AC-6.2 | Detailed report with filters | ✅ Filter by date range, project, client, billable; paginated |
| AC-6.3 | Weekly report shows day breakdown | ✅ Mon–Sun day columns with correct hour totals |
| AC-6.4 | Charts render correctly | ✅ Recharts BarChart (summary + weekly) + PieChart (summary) |
| AC-6.5 | Export generates valid files | ✅ CSV downloads for all three tabs; PDF via browser print |
| AC-6.6 | Shared link works | ✅ POST /reports/shares → token; GET /public/reports/{token} returns data without auth |
| AC-6.7 | Tests pass | ✅ `dotnet test` + `pnpm test` + `pnpm test:e2e` all green |

## Implementation Notes

### Backend

- **ReportRepository** (`Infrastructure/Persistence/Repositories/ReportRepository.cs`): Aggregation logic using LINQ + EF Core. All three report types implemented as separate repository methods.
- **SharedReport entity** (`Domain/TimeTracking/SharedReport.cs`): Stores token (URL-safe base64, 24 chars), report type, JSON-serialized filters, optional expiration.
- **Migration**: `Phase6SharedReports` migration creates the `shared_reports` table.
- **Public endpoint**: `GET /api/public/reports/{token}` is `AllowAnonymous()` — no auth required.
- **ClientId filter**: The Summary report with `GroupBy=Client` works by joining via Project.ClientId.

### Frontend

- **Single page with tabs** (`app/(app)/reports/page.tsx`): Summary | Detailed | Weekly tabs share a common filter bar. Tab state is controlled locally.
- **Filter bar**: Date presets (this-week/last-week/this-month/last-month), native `<select>` for Project/Client/Billable filters.
- **Recharts**: BarChart (grouped by category or week) + PieChart (distribution) in Summary; BarChart trend in Weekly.
- **CSV export**: Client-side `Blob` generation + `<a>` click download — no server roundtrip.
- **Share**: `POST /api/reports/shares` now requires a user-defined share name, `GET /api/reports/shares` lists current account shares, `DELETE /api/reports/shares/{id}` removes them, and the reports page exposes copy/delete management for existing shared links.
- **Sidebar**: Added "Reports" link with `BarChart2` icon to the Insights section.
- **Compatibility note (2026-03-25)**: Saved/shared report payloads now accept both legacy title-case and normalized lowercase `groupBy` values, and persistence normalizes them to lowercase so older saved views continue updating successfully.

### Tests

- **Backend**: `ReportEndpointTests.cs` — 8 integration tests covering all 3 report types + shared report CRUD.
- **Frontend unit**: `hooks/__tests__/reports.test.ts` — 8 tests for response shapes and utility logic.
- **Frontend E2E**: 4 new tests in `e2e/app.spec.ts` — reports page tabs, presets, sidebar navigation, tab switching.
- **Fixed**: `timer-bar.test.tsx` — added missing mocks (`useUpdateTimeEntry`, `useAdjustTimerStart`, `useTags`) and `QueryClientProvider` wrapper; fixed `isBillable` default assertion.
