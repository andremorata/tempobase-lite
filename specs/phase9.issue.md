# Phase 9 — Billing & Rates

## Objective

Extend TempoBase reporting with billable amount calculations using hourly rates at project and
task level. Reports surface monetary billed amounts in addition to hours. CSV exports include
Amount columns so the data is invoice-ready in external tools.

## Scope

| #   | Deliverable                                               | Status |
| --- | --------------------------------------------------------- | ------ |
| 9.1 | Rate resolution: task rate overrides project rate         | [x]    |
| 9.2 | `BilledAmount` in SummaryReport and DetailedReport DTOs   | [x]    |
| 9.3 | Summary tab — Billed Amount KPI card and per-entry amount | [x]    |
| 9.4 | Detailed tab — Amount column and billed-amount total      | [x]    |
| 9.5 | Task hourly rate editing in task list                     | [x]    |
| 9.6 | Updated CSV exports include Amount column                 | [x]    |
| 9.7 | BE integration tests — billing amounts                    | [x]    |
| 9.8 | FE unit tests — billing display and formatting            | [x]    |
| 9.9 | E2E tests — billing flows                                 | [x]    |

## Acceptance Criteria

| #      | Criterion                          | How To Verify                                                   |
| ------ | ---------------------------------- | --------------------------------------------------------------- |
| AC-9.1 | Billable flag persists              | Already implemented — toggle billable → saved and in reports    |
| AC-9.2 | Rates calculate correctly           | 2h billable × $100/hr project rate → BilledAmount = $200.00     |
| AC-9.3 | Task rate overrides project rate    | Task $120/hr, project $80/hr → report shows $120/hr × hours     |
| AC-9.4 | Non-billable entries = $0           | IsBillable=false entry with project rate → BilledAmount = 0     |
| AC-9.5 | Billable entries with no rate = $0  | IsBillable=true, no rate on project or task → BilledAmount = 0  |
| AC-9.6 | Invoice export contains rate data   | CSV download includes Hours and Amount columns                   |
| AC-9.7 | Task hourly rate editable in UI     | Edit task in project card → rate input visible and saved         |
| AC-9.8 | Tests pass                          | `dotnet test` + `pnpm test` + `pnpm test:e2e` → all green       |

## Implementation Notes

- **No new DB migration required** — `hourly_rate` already exists on `projects` and
  `project_tasks` tables with `numeric(18,4)` type.
- **Rate resolution chain**: `taskRate ?? projectRate ?? 0`
- **BilledAmount computation**: `IsBillable ? DurationDecimal * effectiveRate : 0`
- **Summary report** groups aggregate `BilledAmount` by summing per-entry computed values.
- **Detailed report** adds `BilledAmount` per entry row and `TotalBilledAmount` aggregate.
- **Weekly report** remains time-only (no monetary column by design).

## Files Modified

### Backend
- `Application/Features/Reports/Dtos/ReportDtos.cs`
- `Infrastructure/Persistence/Repositories/ReportRepository.cs`
- `tests/TempoBase.Api.Tests/ReportEndpointTests.cs`

### Frontend
- `src/lib/api/types.ts`
- `src/app/(app)/reports/page.tsx`
- `src/components/projects/task-list.tsx`
- `src/lib/api/hooks/__tests__/reports.test.ts`
- `e2e/app.spec.ts`
