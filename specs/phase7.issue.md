# Phase 7 — CSV Data Import

> Delivery plan for the TempoBase CSV import module.

## Objective

Import time tracking data from external CSV exports via CSV upload with
column mapping, per-row preview, and editable review before committing.

## Status: Completed

## Deliverables

| # | Deliverable | Status | Files |
|---|-------------|--------|-------|
| 7.1 | Backend DTOs (`ImportPreviewRow`, `ImportParseResponse`, `ImportRowRequest`, `ImportExecuteRequest`, `ImportExecuteResponse`) | ✅ Done | `Application/Features/Imports/Dtos/ImportDtos.cs` |
| 7.2 | `IImportRepository` + `ImportRepository` (CSV parser + batch execute) | ✅ Done | `Infrastructure/Persistence/Repositories/ImportRepository.cs` |
| 7.3 | `POST /api/imports/time-entries/parse` endpoint | ✅ Done | `Api/Endpoints/Imports/ParseTimeEntriesEndpoint.cs` |
| 7.4 | `POST /api/imports/time-entries/execute` endpoint | ✅ Done | `Api/Endpoints/Imports/ExecuteImportEndpoint.cs` |
| 7.5 | Frontend import types + `useParseCsvImport` + `useExecuteImport` hooks | ✅ Done | `lib/api/types.ts`, `lib/api/hooks/imports.ts` |
| 7.6 | `/imports` page (upload zone, preview table, project selector per row, execute) | ✅ Done | `app/(app)/imports/page.tsx` |
| 7.7 | Sidebar "Import" link under Data group | ✅ Done | `components/layout/app-sidebar.tsx` |
| 7.8 | Backend integration tests | ✅ Done | `tests/TempoBase.Api.Tests/ImportEndpointTests.cs` (9 tests) |
| 7.9 | Frontend unit tests | ✅ Done | `lib/api/hooks/__tests__/imports.test.ts` (15 tests) |
| 7.10 | E2E tests | ✅ Done | `e2e/app.spec.ts` (4 new import tests) |

## Acceptance Criteria

| # | Criterion | Status |
|---|-----------|--------|
| AC-7.1 | CSV is pre-processed with preview and per-row validation | ✅ `POST /imports/time-entries/parse` returns rows, suggestions, and per-row errors |
| AC-7.2 | User reviews and corrects mappings before importing | ✅ UI allows adjusting project/description per row, include/exclude toggle |
| AC-7.3 | Execution creates consistent time entries | ✅ `POST /imports/time-entries/execute` creates entries and returns summary + errors |
| AC-7.4 | Detailed time-report CSV format supported | ✅ Header normalisation handles the supported detailed-report column set |
| AC-7.5 | Tests pass | ✅ `dotnet test` + `pnpm test` + `pnpm test:e2e` → green |

## Implementation Notes

### Backend

- **CSV parser** (`ImportRepository.ParseCsvAsync`): Reads stream line-by-line. Header normalised to lowercase with non-alphanumeric chars stripped for flexible matching. Supports quoted fields and double-quote escaping. Supports `yyyy-MM-dd` plus an explicit user-selected slash-based format (`DD/MM/YYYY` or `MM/DD/YYYY`) with `HH:mm:ss`/`HH:mm` time formats.
- **Parse options**: `POST /imports/time-entries/parse` accepts multipart fields for both the CSV `file` and a `dateFormat` value (`ymd`, `dmy`, `mdy`). Invalid format values are rejected with a validation-style 400 response.
- **Column matching**: Required columns are `startdate`, `starttime`, `enddate`, `endtime` (normalised). Optional: `client`, `project`, `task`, `description`, `billable`.
- **Project suggestion**: Looks up tenant's active projects by name (case-insensitive). Matches task within matched project. Returns `SuggestedProjectId`/`SuggestedTaskId` — the user can override in the review UI.
- **Execute**: Iterates `ImportRowRequest` list. Rows with `Include=false` are counted as skipped. Valid rows are passed to `TimeEntry.CreateManual` (domain factory enforces business rules). All created entries are saved in a single `SaveChangesAsync` call.
- **Validator**: `ExecuteImportValidator` enforces rows list non-null, 1–5000 rows.
- **No new migration** — no new DB tables; creates records in existing `time_entries` table.

### Frontend

- **Upload zone**: Drag-and-drop or click-to-browse `<input type="file" accept=".csv">`. Uses `useMutation` + `FormData` for multipart upload.
- **Date format selection**: `/imports` now exposes a visible date-format selector before upload so users can parse supported CSV files using `YYYY-MM-DD`, `DD/MM/YYYY`, or `MM/DD/YYYY` explicitly instead of relying on implicit US-style detection.
- **Preview table**: Editable description input, project selector (native `<select>` with tenant projects) styled for both light and dark themes, billable checkbox, include checkbox. Row grayed out when excluded. Error badge shows per-row parse issues.
- **Project override**: Suggested project pre-selected; user can change. Task support in state but not exposed in current UI (requires project-scoped task fetch — deferred to Phase 10 enhancement).
- **Execute**: Sends `ImportExecuteRequest` JSON. On success, shows summary banner and removes imported rows. Failed rows remain with error displayed.
- **Toolbar**: "Select valid" (selects only rows with no parse errors), "Deselect all", "Import N entries" button.
