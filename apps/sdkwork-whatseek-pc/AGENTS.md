# Repository Guidelines — apps/sdkwork-whatseek-pc

## SDKWORK Soul

Agent execution follows `../../../sdkwork-specs/SOUL.md`: specs before memory, dictionary before context, evidence before completion, stop on ambiguity.

## SDKWORK Standards

Use `../../../sdkwork-specs/README.md` and `../../../sdkwork-specs/AGENTS_SPEC.md` as the global authority. Load only the task-specific standards selected by the root matrix. Repository entrypoint: `../../AGENTS.md`.

## Application Identity

App surface: `sdkwork-whatseek-pc` — the desktop-class PC client of WhatSeek (问寻). Domain `whatseek`; five navigation-rail destinations owned by capability packages; shell owns navigation chrome.

## Local Dictionary Structure

- `src/` stays thin (bootstrap/shell entry only); all business behavior lives in `packages/sdkwork-whatseek-pc-*`. Dependency direction: core/commons → shell → capability packages → root src. Internal deps use `workspace:*`; third-party deps use `catalog:`.
- Source configuration: `etc/sdkwork.deployment.config.json` + `etc/browser/runtime-env.<profileId>.json` — `etc/` is this deployable root's source configuration.
- `specs/component.spec.json` is the app-root machine contract; capability packages own their own `specs/`.

## Documentation Canon

Repository Canon: `../../docs/README.md`; product `../../docs/product/prd/PRD.md`; architecture `../../docs/architecture/tech/TECH_ARCHITECTURE.md`.

## Spec Resolution Order

Use dynamic progressive loading: read this file, then the app declaration (`sdkwork.app.config.json`) and nearest component specs when relevant, then the task row in `../../../sdkwork-specs/README.md`, then only selected standards, and implementation files last. Language-specific standards load on demand only.

## Required Specs By Task Type

- New screen/destination: `../../../sdkwork-specs/APP_PC_ARCHITECTURE_SPEC.md` §10–§11, `../../../sdkwork-specs/APP_PC_REACT_UI_SPEC.md`, `../../../sdkwork-specs/FRONTEND_CODE_SPEC.md` (five UI states §11)
- TypeScript: `../../../sdkwork-specs/TYPESCRIPT_CODE_SPEC.md`; language specs are on-demand only
- Styling: `../../../sdkwork-specs/TAILWIND_CSS_INTEGRATION_SPEC.md`, `../../../sdkwork-specs/THEME_DARKMODE_SPEC.md` (no raw light utilities without dark counterparts; single `@import "tailwindcss"` in `src/index.css`)
- i18n: `../../../sdkwork-specs/I18N_SPEC.md` §6 (`src/i18n/<locale>/<domain>/<capability>/` per package; no locale monoliths)
- List/search: `PAGINATION_SPEC.md`
- Tests: `../../../sdkwork-specs/TEST_SPEC.md` §4, `../../../sdkwork-specs/FRONTEND_CODE_SPEC.md` §11 (Testing Library, behavior-sentence names, five states)
- Commands/workflows: `../../../sdkwork-specs/PNPM_SCRIPT_SPEC.md`, `../../../sdkwork-specs/GITHUB_WORKFLOW_SPEC.md`
- Config/profiles: `../../../sdkwork-specs/SOURCE_CONFIG_SPEC.md`, `../../../sdkwork-specs/ENVIRONMENT_SPEC.md` (Vite mode = `<profile>.<environment>`, outDir `dist/<profile>/<env>/`)

## Code Style Rules

UI → hooks/services → injected ports (`getWhatseekClient`); components never construct clients, raw HTTP, or auth headers. Public exports stay at each package's `src/index.ts`. TypeScript strict family is mandatory; `any` is forbidden in public APIs.

## Build, Test, and Verification

```bash
pnpm typecheck && pnpm test && pnpm build:dev
node ../../../sdkwork-specs/tools/check-pagination.mjs --workspace ../..
```

Standards checks wired at the repository root: `pnpm check`. List and search work routes to `../../../sdkwork-specs/PAGINATION_SPEC.md`; request bounded server pages and run `check-pagination.mjs` once server pagination exists.

## Agent Execution Rules

Follow `../../../sdkwork-specs/SOUL.md`; develop on `main`; capture verification evidence before claiming completion.

## App SDK Consumer Imports Routing

This surface declares no generated SDK dependencies yet (`sdkDependencies: []`). App SDK consumer import work routes to `../../../sdkwork-specs/APP_SDK_INTEGRATION_SPEC.md` §9 — do not copy the normative body here. When the first SDK family lands, import generated clients only through `src/bootstrap/sdkClients.ts` + the core SDK inventory.

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

Human review before landing: contract/boundary changes, new packages, theme token changes, dependency additions, destructive operations, release actions.

## Main-Branch Development

Authority: `../../../sdkwork-specs/REPOSITORY_BASELINE_SPEC.md`. Develop on `main` directly.
