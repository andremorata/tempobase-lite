# TempoBase

**Your time, quantified and clear.**

TempoBase is a full-stack Next.js application for work time tracking with project/task management, daily time entries, automated calculations, and client-facing reports.

## Tech Stack

| Layer | Technology |
| --- | --- |
| App runtime | Next.js 16 + React 19 |
| API layer | App Router Route Handlers |
| Auth | Auth.js v5 |
| Data access | Prisma 7 |
| Database | PostgreSQL 16 |
| Testing | Vitest, Testing Library, Playwright |
| Deployment | Vercel + Neon |

## Local Development

### Prerequisites

- Node.js 22+
- pnpm
- Docker Desktop or compatible local container runtime

### Start the app

```bash
# Start local PostgreSQL
docker compose up

# Run the frontend
cd frontend
pnpm install
pnpm dev
```

## Documentation

Core documentation lives in `docs/` and `specs/`.

- [docs/01-architecture.md](docs/01-architecture.md)
- [docs/02-database.md](docs/02-database.md)
- [docs/03-api-design.md](docs/03-api-design.md)
- [docs/04-frontend.md](docs/04-frontend.md)
- [docs/05-business-rules.md](docs/05-business-rules.md)
- [docs/06-infrastructure.md](docs/06-infrastructure.md)
- [docs/07-cicd.md](docs/07-cicd.md)
- [docs/08-observability.md](docs/08-observability.md)
- [docs/09-testing.md](docs/09-testing.md)
- [docs/10-delivery-workflow.md](docs/10-delivery-workflow.md)
- [docs/11-ai-agent-workflow.md](docs/11-ai-agent-workflow.md)
- [specs/tempobase.plan.md](specs/tempobase.plan.md)
- [specs/progress.status.md](specs/progress.status.md)

## Testing

```bash
pnpm --dir frontend test
pnpm --dir frontend run build
pnpm --dir frontend test:e2e
```
