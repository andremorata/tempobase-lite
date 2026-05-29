# TempoBase — AI Agent Workflow

> Rules for AI agents operating inside the TempoBase repository.

## 1. Source Of Truth

Before substantial work:

1. Read `specs/tempobase.plan.md`.
2. Read `specs/progress.status.md`.
3. Read the GitHub Issue or PR context when the work is issue-driven.
4. Read the related `docs/` files.

Archived phase files under `specs/archive/` are historical records. Do not treat them as active work instructions.

## 2. Implementation Rules

- Implement product behavior in `app/`.
- Use Route Handlers in `app/src/app/api/` for backend behavior.
- Use Prisma and supporting modules for persistence.
- Use Auth.js as the auth model.

## 3. Required Delivery Behavior

- Keep docs, specs, and progress tracking aligned with implementation.
- Add or update tests for behavior changes.

## 4. Safe Execution Pattern

During work:

- stay within the current issue, PR, or user-requested scope,
- keep business rules modular and testable,
- prefer same-origin `/api` consumption,
- record important decisions in docs or specs.

After meaningful work:

- update relevant docs if the architecture or workflow changed,
- update `specs/progress.status.md` when status or evidence changed,
- summarize what changed, how it was verified, and what remains open.
