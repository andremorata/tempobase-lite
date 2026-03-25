# TempoBase — Frontend Architecture

> Frontend and full-stack app conventions for TempoBase.

## 1. Overview

`frontend/` is both the UI layer and the application backend surface.

- App Router pages deliver the UI.
- Route Handlers under `app/api` implement backend behavior.
- Prisma-backed modules provide persistence.
- Auth.js is the authentication model.

## 2. Platform Decisions

| Area | Selected Option | Notes |
| --- | --- | --- |
| Framework | Next.js 16 + React 19 | App Router architecture |
| Styling | Tailwind CSS v4 | Responsive utility-first styling |
| UI primitives | ShadCN/ui | Accessible component baseline |
| Forms | React Hook Form + Zod | Client validation and UX |
| Data fetching | Same-origin `/api` + app utilities | API consumption |
| Charts | Recharts | Reports and dashboard visuals |
| Theme | next-themes | Light, dark, system |
| Unit/UI tests | Vitest + Testing Library | Fast developer feedback |
| E2E tests | Playwright | Real user flow validation |

## 3. Directory Structure

```text
frontend/
├── prisma/                 # Prisma schema, seeds, and DB tooling
├── src/
│   ├── app/                # App Router pages and Route Handlers
│   ├── components/         # Shared UI components
│   ├── contexts/           # Transitional/global UI state helpers
│   ├── hooks/              # Reusable client hooks
│   ├── lib/                # Auth, API, DB, formatting, domain helpers
│   ├── providers/          # App-level providers
│   └── test/               # Test setup and fixtures
├── e2e/                    # Playwright tests
└── package.json
```

## 4. Route Model

| Area | Purpose |
| --- | --- |
| `src/app/(auth)` | Login, register, invite acceptance, public auth UI |
| `src/app/(app)` | Authenticated product UI |
| `src/app/api` | Backend endpoints |
| `src/app/shared/[token]` | Public shared-report access |

## 5. Frontend Rules

- Prefer Server Components by default.
- Use Client Components only where interaction requires them.
- Keep form and mutation UX explicit with clear loading, success, and error states.
- Prefer same-origin `/api` access patterns so UI and backend remain aligned in one app.
- Keep tenant-sensitive behavior on the server side even when the page is interactive.

## 6. Auth Model

TempoBase uses Auth.js session-based authentication.

- Browser requests to protected Route Handlers rely on session cookies.
- Authorization decisions happen in server-side helpers and Route Handlers.

## 7. UI Expectations

- Mobile-first responsive layout
- Dark theme support
- Keyboard-accessible controls
- Strong validation and readable failure states
- Test coverage for interactive flows

## 8. Testing Expectations

- Pure utilities and rule-heavy helpers should have unit tests.
- Interactive components and hooks should have UI/unit tests.
- Route Handler-backed behavior should be covered by integration tests.
- Important user journeys should have Playwright coverage.

## 9. Related Documents

- [01-architecture.md](01-architecture.md) — Runtime boundaries
- [03-api-design.md](03-api-design.md) — API contract rules
- [09-testing.md](09-testing.md) — Required test coverage
