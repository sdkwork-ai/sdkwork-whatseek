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

## HTTP API Response Envelope Routing

No SDKWork HTTP contracts consumed yet (mock-backed standalone milestone). HTTP API response envelope work routes to `../../../sdkwork-specs/API_SPEC.md`; refresh this managed section with `node ../../../sdkwork-specs/tools/align-agents-http-response-standard.mjs --workspace ../..` when the first HTTP SDK client lands. Never restate the normative envelope body here.

## Human Review Rules

Human review before landing: contract/boundary changes, new packages, theme token changes, dependency additions, destructive operations, release actions.

## Main-Branch Development

Authority: `../../../sdkwork-specs/REPOSITORY_BASELINE_SPEC.md`. Develop on `main` directly.
