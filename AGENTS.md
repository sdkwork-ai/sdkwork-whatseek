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

Run from the repository root; use the narrowest command first: `pnpm --filter <package> typecheck`, then `pnpm typecheck`, `pnpm test`, `pnpm build:h5:dev`. List and search work routes to `../sdkwork-specs/PAGINATION_SPEC.md`; run `check-pagination.mjs` once server pagination exists. Verification before completion: `pnpm typecheck && pnpm test && pnpm build:h5:dev` plus the standards checks wired under `pnpm check`.

## Agent Execution Rules

Follow `../sdkwork-specs/SOUL.md`. Development happens on `main` directly. Stop on ambiguity in identity, ownership, or authority. Capture verification evidence before claiming completion.

## App SDK Consumer Imports Routing

First SDK family landed (2026-10-03 on H5, 2026-10-06 across PC / mini-program / Flutter): the messages and contacts capabilities consume the sdkwork-im composed consumer package — `@sdkwork/im-sdk` on the TypeScript surfaces (open/domain API family `sdkwork-im-sdk`, `/im/v3/api`; declared with credential mode `protected-open-api-api-key-or-dual-token` in each surface core component spec `sdkDependencies`, consumed through `sdkClients: ["@sdkwork/im-sdk"]` at the messages and contacts feature packages) and `im_sdk_composed` on Flutter (generated Dart family, sibling-pinned via `dependency_overrides`). Consumer import naming, composed-facade rules, and verification: `../sdkwork-specs/APP_SDK_INTEGRATION_SPEC.md` §9 — import only the composed consumer package (never generator transport names or deep `generated/server-openapi` paths); additional SDK families follow the same section. Generated clients are constructed only in each surface's app shell bootstrap (`apps/sdkwork-whatseek-{h5,pc}/src/bootstrap/sdkClients.ts`, `apps/sdkwork-whatseek-mini-program/src/bootstrap/runtime.ts`, `apps/sdkwork-whatseek-flutter-mobile/lib/bootstrap/sdk_clients.dart`, APP_SDK_INTEGRATION_SPEC.md §1) and injected into capability packages as ports; UI components never construct clients, parse tokens, or set auth headers. TypeScript sibling source packages are declared once in the root `pnpm-workspace.yaml` and consumed via `workspace:*`; Dart sibling packages via the app-root `dependency_overrides` (`../sdkwork-specs/PNPM_WORKSPACE_DEPENDENCY_SPEC.md` — `link:`/`file:` are forbidden for new SDKWork sibling TS packages). Each surface activates the IM driver from its runtime-env source key `sdkworkImApiBaseUrl` (`SDKWORK_IM_API_BASE_URL` on Flutter); empty (all standalone profiles) keeps the Phase-1 mock clients. The mini-program runtime bundle (`src/runtime/app.js`) is a git-ignored build product: `pnpm build` regenerates it and `pnpm test` builds before testing.

## HTTP API Contract Routing

All SDKWork-owned HTTP contracts follow `../sdkwork-specs/API_SPEC.md` section 4.5 and sections 14-16 (response envelope, list/command input, ProblemDetail errors, int64 wire contract, operation patterns). Generated HTTP SDKs unwrap `data` by default and expose typed numeric `ProblemDetail.code`/`traceId` on errors. Route envelope, error, and pagination work to the global spec — do not copy the normative body here. Before completing API contract, SDK generation, or frontend service work, run the operation-pattern and response-envelope checks wired in `../sdkwork-specs/API_SPEC.md`.
## Human Review Rules

Human review is required before landing: breaking API/contract changes, security-sensitive changes, deletion of generated or shared assets, release/publish actions, and any destructive operation beyond narrow enumerated paths. Follow `../sdkwork-specs/CODE_REVIEW_SPEC.md` and `../sdkwork-specs/DESTRUCTIVE_OPERATION_SPEC.md`.

## Destructive Operation Safety

Authority: `../sdkwork-specs/DESTRUCTIVE_OPERATION_SPEC.md`. Deletion must be explicit, enumerated, and reviewable; wildcard/recursive deletion is forbidden; use the enumerate–contain–classify–batch–confirm–report sequence. Fix forward instead of rolling back; follow `../sdkwork-specs/ROLLBACK_RESTRICTION_SPEC.md`.

## Main-Branch Development

Authority: `../sdkwork-specs/REPOSITORY_BASELINE_SPEC.md`. The default and development branch is `main`. Authored changes are committed onto `main` directly; side branches and detached HEAD are not development venues.
