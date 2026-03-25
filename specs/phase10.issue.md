# Phase 10 — Team & User Management

## Objective

Introduce the account and user-management foundation for TempoBase. This phase starts the
settings surface that will host workspace administration, user profile management, team access,
and later data governance actions.

> Scope note: account settings and profile management were pulled forward from Phase 11 so the
> new settings area can ship as a coherent user-facing entry point before invite and audit-log work
> is completed.

## Scope

| #    | Deliverable                                                    | Status |
| ---- | -------------------------------------------------------------- | ------ |
| 10.1 | Workspace settings API (`GET/PUT /api/account`)                | [x]    |
| 10.2 | Profile API (`GET/PUT /api/users/me`)                          | [x]    |
| 10.3 | Password change API (`POST /api/auth/change-password`)         | [x]    |
| 10.4 | Account invite domain + persistence foundation                 | [x]    |
| 10.5 | Frontend settings page with workspace/profile/security forms   | [x]    |
| 10.6 | Team invite endpoints + invite registration                    | [x]    |
| 10.7 | Team member listing / role management                          | [x]    |
| 10.8 | Data export and purge flows                                    | [x]    |
| 10.9 | FE unit/E2E coverage for settings                              | [x]    |

## Acceptance Criteria

| #       | Criterion                                 | How To Verify                                                        |
| ------- | ----------------------------------------- | -------------------------------------------------------------------- |
| AC-10.1 | Current account settings can be loaded    | `GET /api/account` returns name, slug, timezone, currency            |
| AC-10.2 | Owners/Admins can update workspace config | `PUT /api/account` persists timezone/currency and regenerates slug   |
| AC-10.3 | Users can read and update own profile     | `GET/PUT /api/users/me` updates identity + domain user rows          |
| AC-10.4 | Users can change password in-app          | `POST /api/auth/change-password` succeeds with current password       |
| AC-10.5 | Settings UI is reachable from app shell   | `/settings` builds and renders from sidebar navigation               |
| AC-10.6 | Backend coverage exists for first slice   | `dotnet test ... --filter AccountEndpointTests` passes (6/6)         |
| AC-10.7 | Invite links can onboard a new member     | Owner/Admin creates invite, `/register?invite=...` issues auth tokens |
| AC-10.8 | Team access overview is available         | `GET /api/team/members` and `GET /api/team/invites` return account-scoped data |
| AC-10.9 | Owners/Admins can manage member access    | `PUT /api/team/members/{id}` updates roles and `DELETE /api/team/members/{id}` removes access |
| AC-10.10 | Workspace data can be exported           | `GET /api/account/export` returns account, team, and tracking data snapshot |
| AC-10.11 | Time entries can be purged by range      | `POST /api/account/purge/time-entries` soft-deletes entries within the selected date window |
| AC-10.12 | Owners can hard-delete the workspace     | `POST /api/account/purge/workspace` removes account-scoped data and memberships after password + confirmation |
| AC-10.13 | Users can self-purge their account       | `POST /api/account/purge/me` removes the current user, or the full workspace when the current user is the owner |
| AC-10.14 | Settings FE coverage exists              | Vitest settings-page tests and Playwright settings spec both pass |

## Implementation Notes

- Added `currency` to `accounts` and introduced `account_invites` for upcoming invite-link flows.
- Settings UI now ships workspace, profile, password, and team access sections.
- Invite flow uses shareable registration links rather than email delivery.
- Team access now includes member role editing and member removal from the settings area.
- Member removal currently deletes the account membership records so the email can be invited again later.
- Settings now includes full workspace export, date-range time-entry purge, self-purge, and owner-only workspace deletion controls.
- Destructive delete flows require the current password plus explicit confirmation text before hard-deleting data.
- Frontend coverage now includes role-based settings visibility plus profile, password, invite, and self-delete interaction tests.
- Settings actions now use toast notifications for success and failure states, and API validation payloads are normalized into readable error messages instead of raw JSON output.

## Files Added / Updated

### Backend
- `src/TempoBase.Domain/Tenancy/Account.cs`
- `src/TempoBase.Domain/Tenancy/AccountInvite.cs`
- `src/TempoBase.Domain/Tenancy/Repositories/IAccountInviteRepository.cs`
- `src/TempoBase.Application/Features/Account/Dtos/AccountDtos.cs`
- `src/TempoBase.Application/Features/Auth/Dtos/RegisterViaInviteRequest.cs`
- `src/TempoBase.Application/Features/Team/Dtos/TeamDtos.cs`
- `src/TempoBase.Api/Endpoints/Account/*`
- `src/TempoBase.Api/Endpoints/Auth/ChangePasswordEndpoint.cs`
- `src/TempoBase.Api/Endpoints/Auth/RegisterViaInviteEndpoint.cs`
- `src/TempoBase.Api/Endpoints/Team/*`
- `src/TempoBase.Infrastructure/Data/Configurations/AccountInviteConfiguration.cs`
- `src/TempoBase.Infrastructure/Persistence/Repositories/AccountInviteRepository.cs`
- `src/TempoBase.Infrastructure/Data/Migrations/20260323125235_Phase10AccountSettings*.cs`
- `tests/TempoBase.Api.Tests/AccountEndpointTests.cs`
- `tests/TempoBase.Api.Tests/TeamEndpointTests.cs`
- `tests/TempoBase.Api.Tests/TimerEndpointTests.cs`

### Frontend
- `src/app/(app)/settings/page.tsx`
- `src/app/(app)/settings/__tests__/page.test.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/app/layout.tsx`
- `src/components/ui/toaster.tsx`
- `src/lib/api/client.ts`
- `src/lib/api/hooks/account.ts`
- `src/lib/api/hooks/team.ts`
- `src/lib/api/types.ts`
- `src/contexts/auth-context.tsx`
- `src/components/layout/app-sidebar.tsx`
- `e2e/settings.spec.ts`

## Validation Evidence

- `dotnet build backend/TempoBase.slnx`
- `dotnet test` targeted to `AccountEndpointTests`, `TeamEndpointTests`, and `TimerEndpointTests` via VS Code test runner: 23/23 passing
- `pnpm --dir frontend test -- "src/app/(app)/settings/__tests__/page.test.tsx"`: 6/6 passing
- `pnpm --dir frontend exec playwright test e2e/settings.spec.ts`: 2/2 passing
- `pnpm --dir frontend run build`
