# Repository Guidelines — apps/sdkwork-whatseek-mini-program

## SDKWORK Soul

Agent execution follows `../../../sdkwork-specs/SOUL.md`: specs before memory, dictionary before context, evidence before completion, stop on ambiguity.

## SDKWORK Standards

Use `../../../sdkwork-specs/README.md` and `../../../sdkwork-specs/AGENTS_SPEC.md` as the global authority. Repository entrypoint: `../../AGENTS.md`.

## Application Identity

App surface: `sdkwork-whatseek-mini-program` — the WeChat mini-program client of WhatSeek (问寻). Domain `whatseek`; five native tabBar pages (对话/应用/通讯录/消息/我的) projected from the cross-surface route identities; detail screens live in the `detail` subpackage.

## Local Dictionary Structure

- `packages/sdkwork-whatseek-mp-*` — TypeScript capability packages; they never call `wx.*` — the typed host adapter boundary lives in `src/bootstrap/runtime.ts`.
- `src/pages/` + `src/detail/` — native WeChat pages projected from route contributions.
- `src/runtime/` — esbuild-bundled CommonJS runtime produced by `scripts/build-runtime.mjs` (committed so DevTools open directly).
- `config/mini-program/` — per-profile runtime-env sources; `etc/` — the deployment index.

## Spec Resolution Order

Use dynamic progressive loading: read this file, then the app declaration, then the task row in `../../../sdkwork-specs/README.md`, then only selected standards; implementation files last. Language-specific standards load on demand only.

## Required Specs By Task Type

- Surface work: `MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md`, `APP_MINI_PROGRAM_UI_SPEC.md`, `APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`
- Commands/workflows: `PNPM_SCRIPT_SPEC.md`, `GITHUB_WORKFLOW_SPEC.md`
- List/search: `PAGINATION_SPEC.md` (run `check-pagination.mjs` once server pagination exists)
- TypeScript: `TYPESCRIPT_CODE_SPEC.md` (on-demand only)
- Config: `SOURCE_CONFIG_SPEC.md`, `ENVIRONMENT_SPEC.md`
- Naming: `NAMING_SPEC.md` (kebab-case `mp-*` packages; wx calls only in the bootstrap)

## Code Style Rules

UI pages bind data and events only; all domain logic flows through the bundled runtime (`PageApi`). Shared domain logic lives in the common service family (`@sdkwork/whatseek-service-core` et al.) — never duplicated into the packages here.

## Build, Test, and Verification

```bash
pnpm typecheck && pnpm test && pnpm build
```

Open the WeChat DevTools with `miniprogramRoot=src/` (see `project.config.json`).

## Agent Execution Rules

Follow `../../../sdkwork-specs/SOUL.md`; develop on `main`; capture verification evidence before claiming completion.

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

Human review before landing: `app.json` page/tab changes, runtime bundle regeneration, new packages, dependency additions.

## Main-Branch Development

Authority: `../../../sdkwork-specs/REPOSITORY_BASELINE_SPEC.md`. Develop on `main` directly.
