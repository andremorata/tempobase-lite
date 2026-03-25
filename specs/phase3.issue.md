# Phase 3 — Authentication & Multi-Tenant

## Objective

Complete auth system: registration, JWT login, refresh, and logout. Multi-tenant data isolation enforced at the API layer. Frontend auth pages and JWT API client.

## Dependencies

- Phase 2 (domain layer & database) complete.

## Scope

### Included

- ASP.NET Identity (`IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>`)
- JWT generation via `FastEndpoints.Security` (`JWTBearer.CreateToken`)
- Refresh tokens stored in `AspNetUserTokens`
- Auth endpoints: register, login, refresh, logout
- `IAuthService`, `IJwtService`, `IEmailService`, `ICurrentUserService` interfaces
- `JwtService`, `AuthService`, `CurrentUserService`, `MockEmailService` implementations
- `ICurrentUserService` for tenant resolution in all endpoints
- Frontend: `AuthProvider` React context with JWT decode (`useAuth` hook)
- Frontend: `apiFetch` API client with JWT interceptor
- Frontend: login page and register page (react-hook-form + zod)
- ShadCN `Label` component
- Dark theme: `next-themes` + `ThemeProvider` (deferred to Phase 5 if not in this phase)
- Unit/integration tests (BE)
- Unit tests FE (Vitest): `useAuth` hook

### Excluded

- FIDO2 / Passkeys (deferred)
- TOTP 2FA (deferred)
- Full password recovery flow (deferred)
- E2E tests (deferred to Phase 5 alongside full UI)

## Deliverables

| #   | Deliverable                       |
| --- | --------------------------------- |
| 3.1 | Auth endpoints (register/login/refresh/logout) |
| 3.2 | JwtService + AuthService + CurrentUserService  |
| 3.3 | MockEmailService                              |
| 3.4 | Frontend: auth context + useAuth hook         |
| 3.5 | Frontend: apiFetch API client                 |
| 3.6 | Frontend: login + register pages              |

## Acceptance Criteria

| #      | Criterion                   | How To Verify                                               |
| ------ | --------------------------- | ----------------------------------------------------------- |
| AC-3.1 | Register and login work     | POST returns correct JWT + refresh tokens                   |
| AC-3.2 | Refresh token works         | Token renewed without re-login                              |
| AC-3.3 | Logout invalidates token    | Refresh token removed from store                            |
| AC-3.4 | Frontend auth flows work    | Login, register, and protected route access work in Next.js |
| AC-3.5 | `dotnet build` clean        | 0 warnings, 0 errors                                        |

## Status

**Completed (validated)** — 2026-03-21

### Evidence

- ASP.NET Identity with `IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>`
- JWT generation via `JWTBearer.CreateToken()` (FastEndpoints.Security)
- Refresh tokens stored in `AspNetUserTokens`
- 4 auth endpoints: register, login, refresh, logout
- `AuthProvider` React context with JWT decode
- `apiFetch` client with JWT Authorization header
- Login + register pages with react-hook-form + zod
- ShadCN `Label` component added
- `dotnet build --configuration Release` → 0 warnings, 0 errors

### Key Files

- `Infrastructure/Identity/AppUser.cs`
- `Infrastructure/Auth/{JwtService,AuthService,CurrentUserService}.cs`
- `Infrastructure/Email/MockEmailService.cs`
- `Application/Interfaces/I{Auth,Jwt,Email,CurrentUser}Service.cs`
- `Api/Endpoints/Auth/*`
- `frontend/src/contexts/auth-context.tsx`
- `frontend/src/lib/api/client.ts`
- `frontend/src/app/(auth)/login/page.tsx`
- `frontend/src/app/(auth)/register/page.tsx`
