# TempoBase — Testing Strategy

> Quality strategy using Vitest, Testing Library, Playwright, and PostgreSQL-backed integration tests.

## 1. Testing Goals

- Testing is part of delivery, not a cleanup phase.
- All behavior must be protected by automated coverage.

## 2. Test Pyramid

| Layer | Purpose | Tooling |
| --- | --- | --- |
| Unit | Pure business logic and utilities | Vitest |
| Integration | Route Handler + Prisma + PostgreSQL collaboration | Vitest + PostgreSQL test environment |
| UI unit | Components and hooks | Vitest + Testing Library |
| End-to-end | Real user flows | Playwright |

## 3. Test Targets

| Change Type | Minimum Test Level |
| --- | --- |
| Pure rule or calculation | Unit |
| Prisma data access behavior | Integration |
| Route Handler behavior | Integration |
| Interactive component logic | UI unit |
| Authenticated user flow | End-to-end |
| Bug fix | Regression at the lowest effective level |

## 4. Suggested Structure

```text
frontend/
├── src/
│   ├── app/                 # Route Handlers and app routes under test
│   ├── components/          # Component tests
│   ├── lib/                 # Business/auth/db helpers and tests
│   └── test/                # Shared fixtures, setup, helpers
├── prisma/                  # Schema and test seed support
└── e2e/                     # Playwright suites
```

## 5. Verification Expectations

- Run focused tests while implementing.
- Run broader affected suites before considering work complete.
- Record meaningful verification evidence in `specs/progress.status.md` when phase status changes.
