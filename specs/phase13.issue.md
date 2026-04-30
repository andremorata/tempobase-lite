# Phase 13 — Production Hardening

> Delivery plan for the current production-hardening pass focused on restoring a clean validation baseline.

## Objective

Identify and fix the failures surfaced by the current frontend verification sequence so the production branch can return to a reliable, releasable state.

## Scope

### Included

- Triage of the failures from `p lint`, `p build`, `p test`, and `p test:e2e` in `frontend/`.
- Root-cause fixes needed to restore the expected validation baseline.
- Small, targeted hardening changes required to keep the repaired flows stable in production.
- Regression coverage updates where needed to lock in repaired behavior.
- Specs and status tracking updates for this repair pass.

### Excluded

- New product features or UX expansion unrelated to the failing validations.
- Broad refactors that are not required to resolve the current failures.
- Declaring release readiness before the validation sequence is green.

## Deliverables

| # | Deliverable | Status |
| --- | --- | --- |
| 13.1 | Failure triage for the current `p lint; p build; p test; p test:e2e` run | In progress |
| 13.2 | Targeted fixes for blocking lint, build, unit/integration, and E2E failures | Planned |
| 13.3 | Regression coverage updates for repaired paths where gaps are found | Planned |
| 13.4 | Re-run of the validation sequence with captured evidence | Planned |
| 13.5 | Specs/progress updates reflecting actual validation state | In progress |

## Acceptance Criteria

| # | Criterion | Status |
| --- | --- | --- |
| AC-13.1 | Root causes for the current failing validation sequence are identified and documented in working notes or PR context | In progress |
| AC-13.2 | `p lint` completes successfully in `frontend/` | Not started |
| AC-13.3 | `p build` completes successfully in `frontend/` | Not started |
| AC-13.4 | `p test` completes successfully in `frontend/` | Not started |
| AC-13.5 | `p test:e2e` completes successfully in `frontend/` | Not started |
| AC-13.6 | No completion claim is made until the full validation sequence is green | In progress |

## Dependencies

- `frontend/` contains the active application, test suite, and Prisma-backed runtime being hardened.
- The latest known evidence for this pass is the failed validation sequence reported from `E:\tempobase-lite\frontend`.

## Validation Commands

- `cd frontend && p lint`
- `cd frontend && p build`
- `cd frontend && p test`
- `cd frontend && p test:e2e`

## Validation Notes

- Current state is not green. The combined verification sequence `p lint; p build; p test; p test:e2e` last exited with code `1` in `E:\tempobase-lite\frontend`.
- This phase remains in progress until each command above is rerun successfully and the evidence is recorded.
