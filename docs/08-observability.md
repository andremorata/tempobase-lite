# TempoBase — Observability

> Monitoring and diagnostics guidance.

## 1. Objectives

- Detect request failures quickly.
- Make auth and data-access problems diagnosable.
- Preserve enough context to investigate tenant-scoped issues safely.
- Keep the baseline simple enough for low-cost hosting.

## 2. Signals

| Signal | Purpose | Baseline |
| --- | --- | --- |
| Application logs | Request and error diagnosis | Structured server logs from the app runtime |
| Database diagnostics | Query and connection troubleshooting | Prisma and database-side diagnostics |
| Hosting telemetry | Deploy/runtime health | Vercel runtime and request telemetry |
| Product health checks | Smoke verification | Route-based health/status checks where implemented |

## 3. Logging Rules

- Prefer structured logs for server-side code paths.
- Include request-scoped identifiers where practical.
- Include account and user identifiers only when needed for diagnosis.
- Never log passwords, secrets, session tokens, or raw connection strings.
- Keep error logs readable enough to correlate auth, validation, and persistence failures.

## 4. What To Watch

| Area | What matters |
| --- | --- |
| Auth | Login failures, session callback errors, authorization denials |
| API routes | 4xx and 5xx trends, slow handlers, repeated validation failures |
| Database | Connection failures, migration failures, slow queries, pool pressure |
| Imports/reports | Long-running operations, repeated parsing failures, export/share failures |

## 5. Baseline Practices

- Log Route Handler failures with enough context to reproduce the issue safely.
- Log important auth transitions on the server side without exposing sensitive data.
- Capture Prisma/database errors in a normalized way.
- Keep health checks and smoke checks simple and actionable.
- Prefer platform-native telemetry first before adding heavier custom infrastructure.

## 6. Retention And Cost Guidance

- Start with platform-provided telemetry and app logs.
- Add heavier observability components only when the product need is clear.
- Treat advanced centralized observability stacks as a later optimization, not a default.

## 7. Alerts

At minimum, the system should be able to detect:

- app not serving requests,
- repeated auth failures caused by misconfiguration,
- database connectivity failures,
- broken deployment after migration changes.

## 8. Related Documents

- [01-architecture.md](01-architecture.md) — Runtime boundaries
- [06-infrastructure.md](06-infrastructure.md) — Hosting and environment model
- [07-cicd.md](07-cicd.md) — Deployment validation path
