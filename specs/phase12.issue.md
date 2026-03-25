# Phase 12 — Branch Alignment, Cleanup, and Zero-Cost Deployment

> Delivery plan for making TempoBase a clean single-stack Next.js/Prisma/Auth.js application.

## Objective

Remove the legacy .NET backend and Azure infrastructure from the repository, align all docs and specs to treat the Next.js implementation as the only system, and establish the zero-cost deployment path on Vercel + Neon.

## Scope

### Included

- Specs, docs, and status alignment.
- Removal of `backend/`, `infra/`, and Azure CI/CD workflows.
- Zero-cost deployment guidance centered on Vercel + Neon.
- Branch status tracking.

### Excluded

- Unrelated feature work.
- Hardening work beyond documenting the intended deployment path.

## Deliverables

| # | Deliverable | Status |
| --- | --- | --- |
| 12.1 | Align master plan, phase issue, and progress tracker | Done |
| 12.2 | Realign architecture, API, database, frontend, testing, workflow, and backend docs | Done |
| 12.3 | Update README and deployment guidance | Done |
| 12.4 | Remove legacy backend, Azure infra, and CI/CD workflows | Done |
| 12.5 | Clean up all docs and specs to remove legacy references | Done |

## Acceptance Criteria

| # | Criterion | Status |
| --- | --- | --- |
| AC-12.1 | Docs and specs identify Next.js/Prisma/Auth.js as the architecture | Met |
| AC-12.2 | `backend/` directory removed from the repository | Met |
| AC-12.3 | `infra/` directory and Azure CI/CD workflows removed | Met |
| AC-12.4 | Deployment docs point to the Vercel + Neon path | Met |
| AC-12.5 | No orphaned references to legacy .NET/Azure stack in docs | Met |

## Dependencies

- `frontend/` contains the active implementation.

## Validation Plan

- Review affected docs and specs for consistency.
- Ensure README and deployment docs direct contributors to the correct stack.
