# Phase 13 — Production Hardening

> Delivery plan for the current production-hardening pass focused on restoring a clean validation baseline.

## Objective

Identify and fix the failures surfaced by the current app verification sequence so the production branch can return to a reliable, releasable state.

## Scope

### Included

- Triage of the failures from `pnpm lint`, `pnpm build`, `pnpm test`, and `pnpm test:e2e` for the app runtime.
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
| AC-13.2 | `pnpm lint` completes successfully from the repository root | Not started |
| AC-13.3 | `pnpm build` completes successfully from the repository root | Not started |
| AC-13.4 | `pnpm test` completes successfully from the repository root | Not started |
| AC-13.5 | `pnpm test:e2e` completes successfully from the repository root | Not started |
| AC-13.6 | No completion claim is made until the full validation sequence is green | In progress |

## Dependencies

- `app/` contains the active application, test suite, and Prisma-backed runtime being hardened.
- The latest known evidence for this pass is the failed validation sequence reported before the app directory rename.

## Validation Commands

- `pnpm lint`
- `pnpm build`
- `pnpm test`
- `pnpm test:e2e`

## Validation Notes

- Current state is not green until the root-level validation sequence is rerun and captured after the `app/` rename.
- This phase remains in progress until each command above is rerun successfully and the evidence is recorded.
