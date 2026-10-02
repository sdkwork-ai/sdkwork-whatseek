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

This repository currently declares no generated SDK dependencies (`sdkDependencies: []` at the H5 core component spec). App SDK consumer import work routes to `../sdkwork-specs/APP_SDK_INTEGRATION_SPEC.md` §9 — copy the canonical managed text from there when the first SDK family lands; never restate the normative body here. Generated clients are imported only through `src/bootstrap/sdkClients.ts` and the core SDK inventory, never constructed inside UI components.

## HTTP API Response Envelope Routing

This repository currently consumes no SDKWork HTTP app-api/backend-api/open-api contracts (mock-backed standalone milestone). HTTP API response envelope work routes to `../sdkwork-specs/API_SPEC.md`; refresh this managed section with `node ../sdkwork-specs/tools/align-agents-http-response-standard.mjs --workspace ..` when the first HTTP SDK client is introduced. List and search work routes to `../sdkwork-specs/PAGINATION_SPEC.md`; verify canonical pagination with `node ../sdkwork-specs/tools/check-pagination.mjs --workspace .` once server pagination exists.

## Human Review Rules

Human review is required before landing: breaking API/contract changes, security-sensitive changes, deletion of generated or shared assets, release/publish actions, and any destructive operation beyond narrow enumerated paths. Follow `../sdkwork-specs/CODE_REVIEW_SPEC.md` and `../sdkwork-specs/DESTRUCTIVE_OPERATION_SPEC.md`.

## Destructive Operation Safety

Authority: `../sdkwork-specs/DESTRUCTIVE_OPERATION_SPEC.md`. Deletion must be explicit, enumerated, and reviewable; wildcard/recursive deletion is forbidden; use the enumerate–contain–classify–batch–confirm–report sequence. Fix forward instead of rolling back; follow `../sdkwork-specs/ROLLBACK_RESTRICTION_SPEC.md`.

## Main-Branch Development

Authority: `../sdkwork-specs/REPOSITORY_BASELINE_SPEC.md`. The default and development branch is `main`. Authored changes are committed onto `main` directly; side branches and detached HEAD are not development venues.
