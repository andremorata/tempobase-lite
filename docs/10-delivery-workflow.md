# TempoBase — Delivery Workflow

> Issue-driven delivery process for the live TempoBase product.

## 1. Delivery Flow

1. Use the GitHub Issue as the source of scope, acceptance criteria, and discussion when work is issue-driven.
2. Read [specs/tempobase.plan.md](../specs/tempobase.plan.md) for product baseline when broader context is needed.
3. Read [specs/progress.status.md](../specs/progress.status.md) for current validation posture and known risks.
4. Read the affected docs in `docs/`.
5. Implement changes in small increments.
6. Add or update automated tests.
7. Update docs or current status when architecture, workflow, validation posture, or known risks change.

## 2. Definition of Ready

Work is ready to start when:

- the issue or user request has clear scope and acceptance criteria,
- the affected docs are good enough to guide implementation,
- known gaps are identified.

## 3. Definition of Done

Work is done when:

- implementation is complete,
- tests exist at the correct level,
- relevant docs/specs are updated,
- validation evidence is recorded in the issue, PR, or `specs/progress.status.md` when repository posture changes.

## 4. Historical Specs

Archived files under `specs/archive/` document the initial product build-out. They are useful for historical context, but they are not active scope or acceptance criteria.

## 5. Related Documents

- [09-testing.md](09-testing.md) — Coverage expectations
- [11-ai-agent-workflow.md](11-ai-agent-workflow.md) — Agent operating rules
