# TempoBase — API Design

> API conventions for Route Handlers.

## 1. Scope

- Protocol: HTTPS + JSON
- Runtime: Next.js Route Handlers under `frontend/src/app/api/`
- Primary consumer: TempoBase frontend
- Auth model: Auth.js session cookies for authenticated app requests

## 2. Authentication Model

### Public auth endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create account and owner user |
| POST | `/api/auth/register-invite` | Accept invite into an existing account |
| GET/POST | `/api/auth/[...nextauth]` | Auth.js credentials and session flow |

### Authenticated auth endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/change-password` | Change current user password |

### Required request context

| Item | Required | Notes |
| --- | --- | --- |
| `Content-Type: application/json` | For JSON bodies | Standard request body format |
| Auth.js session cookie | For protected routes | Sent automatically by the browser |

## 3. Resource Conventions

- Base path: `/api/{resource}`
- Naming: plural nouns, kebab-case where relevant
- Filtering: query params per field
- Pagination: page/pageSize or cursor where needed
- Errors: structured JSON, ideally Problem Details style for user-facing failures

## 4. Core Resource Areas

| Area | Representative Paths |
| --- | --- |
| Auth | `/api/auth/*` |
| Time entries | `/api/time-entries*` |
| Projects | `/api/projects*` |
| Tasks | `/api/projects/[projectId]/tasks*` |
| Clients | `/api/clients*` |
| Tags | `/api/tags*` |
| Reports | `/api/reports*`, `/api/public/reports/*` |
| Team/settings/audit | `/api/team*`, `/api/account*`, `/api/audit-logs*` |

## 5. Contract Guidance

- Route Handlers should validate inputs close to the edge.
- Response shapes should stay stable across frontend usage and tests.
- Multi-tenant behavior must always scope reads and writes to the current account.

## 6. Contract Categories

| Category | Typical Behavior |
| --- | --- |
| CRUD endpoints | Validate input, scope by account, return stable JSON shapes |
| Derived-data endpoints | Aggregate per-account results and keep filters explicit |
| Public share endpoints | Limit access to the intended public payload only |
| Admin endpoints | Enforce owner/admin authorization before data access |

## 7. Related Documents

- [01-architecture.md](01-architecture.md) — Runtime boundaries
- [02-database.md](02-database.md) — Persistence model
- [04-frontend.md](04-frontend.md) — Frontend consumption patterns
- [09-testing.md](09-testing.md) — Route Handler testing requirements
