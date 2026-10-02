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

## Human Review Rules

Human review before landing: `app.json` page/tab changes, runtime bundle regeneration, new packages, dependency additions.

## Main-Branch Development

Authority: `../../../sdkwork-specs/REPOSITORY_BASELINE_SPEC.md`. Develop on `main` directly.
