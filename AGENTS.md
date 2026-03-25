# AI Project Scaffold - Copilot Instructions

You are working inside a reusable project scaffold intended to bootstrap new software products with AI-agent support.

Your job is to help turn this scaffold into a concrete project without introducing assumptions that belong to a previous product.

**IMPORTANT**: AGENTS.md IS THE BASE INSTRUCTIONS FILE FOR AI AGENTS WORKING IN THIS REPOSITORY. `CLAUDE.md` AND `.github/copilot-instructions.md` ARE SYMLINKS TO THIS FILE. DO NOT EDIT THOSE FILES DIRECTLY. IF YOU WANT TO CHANGE THE INSTRUCTIONS, EDIT THIS FILE AND THE CHANGES WILL BE REFLECTED IN ALL SYMLINKS AUTOMATICALLY.

## Core Principles

- Treat this repository as a neutral foundation, not as an existing product.
- Prefer reusable patterns over domain-specific implementation shortcuts.
- Document decisions clearly when a project-specific choice is made.
- Keep architecture, delivery, and operational concerns aligned across code and docs.
- When a placeholder exists, either preserve it or replace it with an explicit project decision. Do not invent hidden defaults.
- Default to clean boundaries, testable code, and explicit verification.

## Preferred Workflow

1. Read the relevant files in `docs/` and `specs/` before making structural changes.
2. Identify whether the task is scaffold-level or project-specific.
3. Preserve reusable guidance and remove stale assumptions from previous projects.
4. Update documentation whenever code, infrastructure, or workflows materially change.
5. Leave the repository easier for the next human or agent to understand.

## Specs-Driven Execution

The `specs/` folder is the execution backbone of the project. Agents must treat it as the authoritative source for delivery sequencing and scope control.

### Required files in `specs/`

- `project-template.plan.md` or the project-specific plan file:
  the master plan for phases, scope, sequencing, and major delivery expectations
- `phase-template.issue.md` or the active phase issue files:
  the actionable breakdown for a single phase, milestone, or workstream
- `progress.status.md`:
  the source of truth for current status, validation state, evidence, and next actions

### Required agent behavior

Before doing substantial work:

1. Read the project plan in `specs/` to understand the intended roadmap.
2. Identify the active phase or the phase most directly related to the request.
3. Read the corresponding phase issue file before implementing changes.
4. Check `progress.status.md` to understand the current state, risks, and validation status.

While doing the work:

- Stay aligned with the current plan and phase scope unless the user explicitly changes direction.
- Do not silently implement work that belongs to a later phase if it changes scope, architecture, or delivery order in a meaningful way.
- If the requested change requires deviating from the plan, update the relevant `specs/` files as part of the task or clearly document the mismatch.
- Keep implementation, docs, and progress tracking synchronized.

After completing meaningful work:

- Update the relevant phase issue if scope, tasks, acceptance criteria, or notes changed.
- Update `progress.status.md` when phase status, evidence, risks, or next actions changed.
- Reference the plan and phase context in summaries so future agents can continue from the intended roadmap.

### Precedence inside `specs/`

Use this order when interpreting project intent:

1. Active user instruction
2. The project plan in `specs/`
3. The relevant phase issue file
4. `progress.status.md`

If these conflict, do not guess silently. Align the files as part of the task or call out the mismatch clearly.

## What This Scaffold Should Cover

- Frontend architecture and UX delivery conventions
- Database and persistence guidance
- Infrastructure and environment strategy
- CI/CD pipeline design
- Observability and operational readiness
- Testing strategy across layers
- Delivery phases, progress tracking, and readiness gates
- AI-agent collaboration rules and handoff expectations

## Guardrails

- Do not hardcode domain language unless the current project has explicitly chosen it.
- Do not assume a specific stack unless documented in the active architecture decisions.
- Do not leave orphaned references to previous systems, modules, entities, or brands.
- Prefer templates, placeholders, checklists, and decision records when requirements are still open.
- Do not ignore the `specs/` plan, phase, or progress files when they exist for the active project.

## Documentation Expectations

When creating or editing docs:

- Use clear section headings and checklists.
- Separate confirmed decisions from open questions.
- Keep examples generic unless the repository already defines a concrete stack.
- Note dependencies between architecture, infrastructure, testing, and delivery decisions.
- Keep `docs/` aligned with the current phase plan and update `specs/` when documentation changes affect scope or sequencing.

## Coding Expectations

When source code exists:

- Follow the architecture and testing rules documented for the active project.
- Keep implementation consistent with CI/CD and observability expectations.
- Add or update tests for behavior changes.
- Avoid introducing tooling that conflicts with documented delivery workflows.
- Use the active project plan and phase issue as the default boundary for what should be implemented now.

Unless the project documents a different choice, assume these defaults:

- Keep domain or core logic independent from framework-heavy UI code when practical.
- Treat unit, integration, and end-to-end testing as part of the minimum delivery baseline.
- Prefer test-driven or test-in-parallel development for non-trivial features and bug fixes.
- Add regression tests for defects at the most appropriate level.

## Database Migration Workflow

This project uses **Prisma Migrate** for production database schema management. Migrations are applied automatically during Vercel builds via the `build` script (`prisma migrate deploy`).

### When you change `frontend/prisma/schema.prisma`

You **must** create a migration file. Never rely on `prisma db push` for changes that will be deployed.

1. Make your changes to `frontend/prisma/schema.prisma`.
2. Generate the migration:
   ```bash
   cd frontend
   pnpm exec prisma migrate dev --name short_description_of_change
   ```
   This creates a new timestamped folder under `frontend/prisma/migrations/` with a `migration.sql` file and updates the local database.
3. Commit both the schema change and the generated migration file together.

### Rules

- **Never edit existing migration files** that have already been applied to production. Create a new migration instead.
- **Never delete migration files.** The migration history is append-only.
- **Never use `prisma db push` as a substitute for migrations** in any code path that leads to production. It does not create migration files and will cause drift.
- **Migration names** should be short, lowercase, underscore-separated descriptions: `add_invoice_table`, `make_email_unique`, `drop_legacy_column`.
- **Destructive changes** (dropping columns, tables, or changing types) should be called out explicitly in the PR description. Prisma will warn during `migrate dev` — do not ignore warnings about data loss.
- **The `build` script** in `package.json` runs `prisma generate && prisma migrate deploy && next build`. Do not remove or reorder these steps.

## If the Repository Is Still in Template Mode

In template mode, optimize for:

- clarity,
- reusability,
- low-coupling documentation,
- and smooth project kickoff.

Even in template mode, keep the `specs/` workflow explicit so future projects inherit a plan-first execution model.
