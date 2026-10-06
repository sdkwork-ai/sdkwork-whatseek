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

## App SDK Consumer Imports Routing

First SDK family landed (2026-10-06): the messages and contacts capabilities consume the sdkwork-im composed consumer package `@sdkwork/im-sdk` (open/domain API family `sdkwork-im-sdk`, `/im/v3/api`; declared in the mp-core component spec `sdkDependencies` with credential mode `protected-open-api-api-key-or-dual-token`, consumed through `sdkClients: ["@sdkwork/im-sdk"]` at the mp-messages and mp-contacts feature packages). Import only `@sdkwork/im-sdk` (never generator transport names or deep `generated/server-openapi` paths); consumer import naming, composed-facade rules, and verification: `../../../sdkwork-specs/APP_SDK_INTEGRATION_SPEC.md` §9.

Mini-program runtime adaptation (APP_SDK_INTEGRATION_SPEC.md §3): the composed client is constructed only in the bootstrap composition root (`src/bootstrap/runtime.ts`), with the `wx.request`-backed fetch polyfill and the `wx.connectSocket`-backed realtime factory installed there through the typed ports in `@sdkwork/whatseek-mp-core` — capability packages never touch `wx.*` or transport. The driver activates when `sdkworkImApiBaseUrl` is declared in `config/mini-program/runtime-env.*.json`; empty (all standalone profiles) keeps the mock clients. Additional SDK families follow the same section.

## HTTP API Contract Routing

All SDKWork-owned HTTP contracts follow `../../../../sdkwork-specs/API_SPEC.md` section 4.5 and sections 14-16 (response envelope, list/command input, ProblemDetail errors, int64 wire contract, operation patterns). Generated HTTP SDKs unwrap `data` by default and expose typed numeric `ProblemDetail.code`/`traceId` on errors. Route envelope, error, and pagination work to the global spec — do not copy the normative body here. Before completing API contract, SDK generation, or frontend service work, run the operation-pattern and response-envelope checks wired in `../../../../sdkwork-specs/API_SPEC.md`.
## Human Review Rules

Human review before landing: `app.json` page/tab changes, runtime bundle regeneration, new packages, dependency additions.

## Main-Branch Development

Authority: `../../../sdkwork-specs/REPOSITORY_BASELINE_SPEC.md`. Develop on `main` directly.
