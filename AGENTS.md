# Repository Guidelines

## SDKWORK Soul

Agent execution follows `../sdkwork-specs/SOUL.md`: specs before memory, dictionary before context, evidence before completion, stop on ambiguity, long-running recovery.

## SDKWORK Standards

Canonical standards entrypoint: `../sdkwork-specs/README.md`. Behavior follows `../sdkwork-specs/AGENTS_SPEC.md`. Do not copy normative spec bodies into this repository; reference them by relative path.

## Application Identity

Application id: `sdkwork-whatseek`. Application code: `whatseek`. Domain: `whatseek`. Primary surface: mobile-first H5 super app with five bottom tabs (对话 Chat ｜ 应用 Apps ｜ 通讯录 Contacts ｜ 消息 Messages ｜ 我的 Profile).

## Local Dictionary Structure

- `AGENTS.md` is the repository execution entrypoint.
- `apps/README.md` indexes application roots: `apps/sdkwork-whatseek-common/` (shared family), `apps/sdkwork-whatseek-h5/` (primary H5), `apps/sdkwork-whatseek-pc/` (PC + desktop), `apps/sdkwork-whatseek-mini-program/` (WeChat), `apps/sdkwork-whatseek-flutter-mobile/` (Flutter mobile); the repository root itself is not an app surface.
- `specs/` holds repository machine contracts (`component.spec.json`, `domain.yaml`).
- `etc/` is the deployable-root source configuration index (`etc/sdkwork.deployment.config.json` + `etc/topology/*.env`); the H5 app root owns its own `apps/sdkwork-whatseek-h5/etc/`.
- `docs/` holds the Canon documentation tree.
- `.sdkwork/` holds repository-local agent workspace metadata.

## Documentation Canon

Documentation index: `docs/README.md`. Product Canon: `docs/product/prd/PRD.md`. Technical architecture Canon: `docs/architecture/tech/TECH_ARCHITECTURE.md`.

## Spec Resolution Order

Use dynamic progressive loading: read this file, then the task row in `../sdkwork-specs/README.md`, then only the selected standards, and inspect implementation files last. Language-specific specs are on-demand only. Do not copy root spec bodies locally; do not contradict global standards.

## Required Specs By Task Type

- Agent workflow / repository structure: `../sdkwork-specs/AGENTS_SPEC.md`, `../sdkwork-specs/SDKWORK_WORKSPACE_SPEC.md`, `../sdkwork-specs/DOCUMENTATION_SPEC.md`, `../sdkwork-specs/REPOSITORY_BASELINE_SPEC.md`
- H5 app feature work: `../sdkwork-specs/APP_H5_ARCHITECTURE_SPEC.md`, `../sdkwork-specs/APP_MOBILE_REACT_UI_SPEC.md`, `../sdkwork-specs/FRONTEND_CODE_SPEC.md`, `../sdkwork-specs/UI_ARCHITECTURE_SPEC.md`
- PC feature work: `../sdkwork-specs/APP_PC_ARCHITECTURE_SPEC.md`, `../sdkwork-specs/APP_PC_REACT_UI_SPEC.md`, `../sdkwork-specs/FRONTEND_CODE_SPEC.md`
- Mini-program work: `../sdkwork-specs/MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md`, `../sdkwork-specs/APP_MINI_PROGRAM_UI_SPEC.md`
- Flutter work: `../sdkwork-specs/FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC.md`, `../sdkwork-specs/APP_FLUTTER_UI_SPEC.md`
- Cross-surface work: `../sdkwork-specs/APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` (route ids, i18n keys, and the common shared family are the only cross-surface seams)
- TypeScript work: `../sdkwork-specs/TYPESCRIPT_CODE_SPEC.md`; language specs load on demand only
- Styling / theme: `../sdkwork-specs/TAILWIND_CSS_INTEGRATION_SPEC.md`, `../sdkwork-specs/THEME_DARKMODE_SPEC.md`
- i18n: `../sdkwork-specs/I18N_SPEC.md`
- List/search: add `../sdkwork-specs/PAGINATION_SPEC.md`
- Tests: `../sdkwork-specs/TEST_SPEC.md`, `../sdkwork-specs/FRONTEND_CODE_SPEC.md` §11
- Commands / packaging workflows / releases: `../sdkwork-specs/PNPM_SCRIPT_SPEC.md`, `../sdkwork-specs/GITHUB_WORKFLOW_SPEC.md`, `../sdkwork-specs/RELEASE_SPEC.md`
- App manifests / source config: `../sdkwork-specs/APP_MANIFEST_SPEC.md`, `../sdkwork-specs/SOURCE_CONFIG_SPEC.md`, `../sdkwork-specs/ENVIRONMENT_SPEC.md`
- Component contracts: `../sdkwork-specs/COMPONENT_SPEC.md`, `../sdkwork-specs/MODULE_SPEC.md`
- Naming: `../sdkwork-specs/NAMING_SPEC.md`

## Int64 Wire Contract (API_SPEC §13.6)

When API contracts are introduced, int64 values MUST be `type: string, format: int64` per `../sdkwork-specs/API_SPEC.md` §13.6.

## Code Style Rules

Keep responsibilities inside their owning package: shell owns navigation chrome; capability packages own screens/services/state/i18n/routes; core owns composition, route table, and SDK inventory; commons owns shared leaf components and utilities. TypeScript strict mode is mandatory. Public exports stay at package `src/index.ts`. UI never constructs SDK clients or HTTP directly — it flows through hooks/services with injected clients.

## Build, Test, and Verification

Run from the repository root; use the narrowest command first: `pnpm --filter <package> typecheck`, then `pnpm typecheck`, `pnpm test`, `pnpm build:h5:dev`. Verification before completion: `pnpm typecheck && pnpm test && pnpm build:h5:dev` plus the standards checks wired under `pnpm check`.

## Agent Execution Rules

Follow `../sdkwork-specs/SOUL.md`. Development happens on `main` directly. Stop on ambiguity in identity, ownership, or authority. Capture verification evidence before claiming completion.

## App SDK Consumer Imports Routing

First SDK family landed (2026-10-03): the messages and contacts capabilities consume the sdkwork-im composed consumer package `@sdkwork/im-sdk` (open/domain API family `sdkwork-im-sdk`, `/im/v3/api`; declared in the H5 core component spec `sdkDependencies` with credential mode `protected-open-api-api-key-or-dual-token`, consumed through `sdkClients: ["@sdkwork/im-sdk"]` at the messages and contacts feature packages). Consumer import naming, composed-facade rules, and verification: `../sdkwork-specs/APP_SDK_INTEGRATION_SPEC.md` §9 — import only `@sdkwork/im-sdk` (never generator transport names or deep `generated/server-openapi` paths); additional SDK families follow the same section. Generated clients are constructed only in the app shell bootstrap (`apps/sdkwork-whatseek-h5/src/bootstrap/sdkClients.ts`, APP_SDK_INTEGRATION_SPEC.md §1) and injected into capability packages as ports; UI components never construct clients, parse tokens, or set auth headers. Sibling source packages are declared once in the root `pnpm-workspace.yaml` and consumed via `workspace:*` (`../sdkwork-specs/PNPM_WORKSPACE_DEPENDENCY_SPEC.md` — `link:`/`file:` are forbidden for new SDKWork sibling packages).

## HTTP API Response Envelope

All L2+ SDKWork-owned custom HTTP contracts, including `app-api`, `backend-api`, and SDKWork-owned business `open-api`, `MUST` follow `API_SPEC.md` section 4.5, section 14, and section 15:

- **Default classification:** omitted `x-sdkwork-wire-protocol` means SDKWork-owned custom API (`sdkwork-v3`); only operation-level `x-sdkwork-wire-protocol: external` plus `x-sdkwork-external-protocol-id` identifies a third-party compatibility `open-api` operation.
- **Input:** typed request bodies, section 14.1 list/search/command input, `SdkWorkListQuery`, and `q` for free-text search.
- **Success output:** `SdkWorkApiResponse` with `{ "code": 0, "data": <payload>, "traceId": "<server-uuid>" }`.
- **Error output:** HTTP 4xx/5xx `application/problem+json` (`ProblemDetail`) with numeric `code` and `traceId`; SDKWork-owned errors may include `i18nKey` and `locale` presentation metadata.
- Success `code` is numeric `int32`; HTTP 2xx JSON bodies `MUST` use `0` only. REST semantics remain on HTTP status (`201`, `202`, etc.).
- Platform error codes are numeric non-zero values per section 15.3 (`40001`, `40101`, `40401`, …).
- Single resource: `data.item`
- Lists: `data.items` + `data.pageInfo` (`PageInfo.mode` is `offset` or `cursor`)
- Commands: `data.accepted` plus optional `resourceId` / `status`
- Async accept (`202`): `data.operationId`, `data.status`, optional `pollUrl`
- Operation patterns: retrieve/list/search/create/update/delete/command/async/bulk semantics follow `API_SPEC.md` section 15.4; create uses `201`, delete uses `204` with no JSON body, and `PUT`/`PATCH` use SDK action `update`.

Vendor compatibility `open-api` routes that mirror upstream tool or provider wire (for example OpenAI `/v1/*`, Anthropic/Claude `/anthropic/v1/*`, Google/Gemini `/google/v1beta/*`, Claude Code, or Codex) `MAY` opt out only when every exempt operation declares operation-level `x-sdkwork-wire-protocol: external` and `x-sdkwork-external-protocol-id` per `API_SPEC.md` section 4.5.2. SDKWork-owned business `open-api` operations `MUST NOT` opt out. Mixed OpenAPI documents are validated per operation; one external operation never exempts SDKWork-owned operations in the same document.

Errors `MUST` use HTTP 4xx/5xx with `application/problem+json` (`ProblemDetail`) including required numeric `code` and `traceId`. Optional `i18nKey` and `locale` are display metadata only. Business failures `MUST NOT` use HTTP 2xx with non-zero `code`, string wire codes, `success`, or human `message`.

Forbidden legacy envelopes and fields: `PlusApiResult`, `AppbaseApiResult`, `StoreApiResult`, `SdkWorkResponse`, per-domain `*ApiResult`, wire field `requestId`, bare domain DTOs at the HTTP root, and top-level `{ items, pageInfo, traceId }` without `data`.

Handlers `MUST` serialize success and map errors through `sdkwork-web-framework` response mapping. Generated HTTP SDKs (`--standard-profile sdkwork-v3`) unwrap `data` by default and expose typed numeric `ProblemDetail.code` / `traceId` and returned localization metadata on errors; use `.raw` when the full envelope is required.

Before completing API contract, SDK generation, or frontend service work, run:

```bash
node <sdkwork-specs>/tools/check-api-operation-patterns.mjs --workspace <workspace-root>
node <sdkwork-specs>/tools/check-api-response-envelope.mjs --workspace <workspace-root>
```

Authority: `sdkwork-specs/API_SPEC.md` section 4.5 and sections 14–16, `SDK_SPEC.md` section 4.2, `FRONTEND_SPEC.md`, `MIGRATION_SPEC.md` section 4.2.

## Human Review Rules

Human review is required before landing: breaking API/contract changes, security-sensitive changes, deletion of generated or shared assets, release/publish actions, and any destructive operation beyond narrow enumerated paths. Follow `../sdkwork-specs/CODE_REVIEW_SPEC.md` and `../sdkwork-specs/DESTRUCTIVE_OPERATION_SPEC.md`.

## Destructive Operation Safety

Authority: `../sdkwork-specs/DESTRUCTIVE_OPERATION_SPEC.md`. Deletion must be explicit, enumerated, and reviewable; wildcard/recursive deletion is forbidden; use the enumerate–contain–classify–batch–confirm–report sequence. Fix forward instead of rolling back; follow `../sdkwork-specs/ROLLBACK_RESTRICTION_SPEC.md`.

## Main-Branch Development

Authority: `../sdkwork-specs/REPOSITORY_BASELINE_SPEC.md`. The default and development branch is `main`. Authored changes are committed onto `main` directly; side branches and detached HEAD are not development venues.
