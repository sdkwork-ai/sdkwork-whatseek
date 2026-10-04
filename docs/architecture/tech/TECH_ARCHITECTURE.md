# whatseek Technical Architecture

Status: active
Owner: sdkwork-whatseek team
Updated: 2026-10-01
Specs: ARCHITECTURE_DECISION_SPEC.md, DOCUMENTATION_SPEC.md

## Document Map

- Add `TECH-<topic>.md` shards in this directory when the architecture grows beyond one reviewable screen.

## 1. Architecture Overview

WhatSeek Phase 1 ships four aligned client surfaces off one shared service core: a mobile-first H5 single-page application (primary), a desktop-class PC browser application with a Tauri v2 desktop shell, a native WeChat mini-program, and a Flutter mobile application. All four render the same five tabs and consume the same domain logic through the shared package family (: route identities, PRD §10.1 intent rules, service ports + mock clients); surfaces never import each other’s UI implementations (APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md). The product loop is: Chat input → intent recognition (rule-based in Phase 1, LLM-backed in Phase 2) → AI Router → domain capabilities (apps / generated apps / contacts / messages / tasks). The bottom shell hosts five tabs (对话/应用/通讯录/消息/我的); every capability package contributes routes and tab metadata to the shell, and the shell owns navigation chrome so all screens render inside one container.

All domain access flows UI hook → service → injected client. Phase 1 ships in-memory mock clients (localStorage-persisted) behind client interfaces so Phase 2 can swap in generated SDK clients without touching UI code.

## 2. Technology Choices

| Concern | Choice | Authority |
| --- | --- | --- |
| Language | TypeScript (strict family, `isolatedModules`, `verbatimModuleSyntax`) | `TYPESCRIPT_CODE_SPEC.md` |
| UI | React 19 + react-router-dom | `APP_H5_ARCHITECTURE_SPEC.md`, `FRONTEND_CODE_SPEC.md` |
| Build | Vite 8, mode = `<deploymentProfile>.<environment>`, outDir `dist/<profile>/<env>/` | `PNPM_SCRIPT_SPEC.md` §4.2, `FRONTEND_CODE_SPEC.md` §10 |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite`, single `@import "tailwindcss"` bootstrap in app `src/index.css`, `@custom-variant dark`, three-layer semantic tokens (`--sdk-ref-*` → `--sdk-color-*` → `--sdk-comp-*`), dual light/dark values, `data-sdk-color-mode` + `dark` class, inline anti-flash boot script | `TAILWIND_CSS_INTEGRATION_SPEC.md`, `THEME_DARKMODE_SPEC.md` |
| State | Zustand for shared cross-package state (session, created apps), `useState`/`useReducer` locally | `FRONTEND_CODE_SPEC.md` §5 |
| i18n | i18next + react-i18next; per-package `src/i18n/<locale>/<domain>/<capability>/` fragments merged at bootstrap; locales zh-CN, en-US | `I18N_SPEC.md` §6/§7 |
| Tests | Vitest + `@testing-library/react`; behavior-sentence test names; five UI states per surface | `TYPESCRIPT_CODE_SPEC.md` §10, `FRONTEND_CODE_SPEC.md` §11, `TEST_SPEC.md` §4 |
| Icons | lucide-react | workspace baseline |
| Package manager | pnpm with `workspace:*` internal deps and `catalog:` third-party pins | `PNPM_WORKSPACE_DEPENDENCY_SPEC.md`, `DEPENDENCY_MANAGEMENT_SPEC.md` |

## 3. System Boundaries And Modules

### 3.1 Multi-Surface Layout

| Surface | Root | Packages | Verification |
| --- | --- | --- | --- |
| Shared | `apps/sdkwork-whatseek-common/` | `sdkwork-whatseek-route-core`, `-intent-core`, `-service-core` | vitest (41 tests) |
| H5 (primary) | `apps/sdkwork-whatseek-h5/` | `sdkwork-whatseek-h5-{core,commons,shell,chat,apps,contacts,messages,profile}` | vitest + build:h5:* |
| PC + desktop | `apps/sdkwork-whatseek-pc/` | `sdkwork-whatseek-pc-{core,commons,shell,chat,apps,contacts,messages,profile}` + `-tauri` host | vitest + build:pc:* + cargo build |
| WeChat mini-program | `apps/sdkwork-whatseek-mini-program/` | `sdkwork-whatseek-mp-{core,commons,shell,chat,apps,contacts,messages,profile}` | tsc + esbuild + node --test contract suite |
| Flutter mobile | `apps/sdkwork-whatseek-flutter-mobile/` | `sdkwork_whatseek_flutter_mobile_{core,commons,shell,chat,apps,contacts,messages,profile}` | flutter analyze (0 issues) + flutter test (15) |


Bounded context: `whatseek` (`specs/domain.yaml`). Packages (dependency direction: core/commons → shell → capability packages → app root src):

- `sdkwork-whatseek-h5-core` — composition root: route table, module registry, SDK client inventory, session/auth state, environment config.
- `sdkwork-whatseek-h5-commons` — shared leaf components (ScreenState, ListRow, Avatar), utilities.
- `sdkwork-whatseek-h5-shell` — bottom tab bar, mobile layout, safe-area handling.
- `sdkwork-whatseek-h5-chat` — AI chat entry: conversation UI, intent recognition service, AI router actions, task state display.
- `sdkwork-whatseek-h5-apps` — app center: discovery/search/categories/detail/invoke, 我的应用, AI app generation flow.
- `sdkwork-whatseek-h5-contacts` — contacts: people/groups/orgs/agents list, detail, search.
- `sdkwork-whatseek-h5-messages` — unified messages: conversation list, chat view, AI task notifications, unread state.
- `sdkwork-whatseek-h5-profile` — profile: user card/session, 我的应用 entry, favorites, settings (theme, language), about.

Phase 1 owns no backend: no `crates/`, no `database/`, no API authorities. `sdkDependencies: []` is declared explicitly at every component spec. Phase 2 introduces generated app SDK clients as injected ports.

## 4. Directory And Package Layout

```text
apps/sdkwork-whatseek-h5/
  src/                     # thin root: main.tsx, App.tsx, AuthGate.tsx, index.css
    bootstrap/             # environment, runtime, sdkClients, routes
    shell/                 # re-export shims to the shell package
  packages/
    sdkwork-whatseek-h5-core/       packages/sdkwork-whatseek-h5-commons/
    sdkwork-whatseek-h5-shell/      packages/sdkwork-whatseek-h5-chat/
    sdkwork-whatseek-h5-apps/       packages/sdkwork-whatseek-h5-contacts/
    sdkwork-whatseek-h5-messages/   packages/sdkwork-whatseek-h5-profile/
  # each package: src/{index.ts,screens/,components/,hooks/,services/,state/,i18n/,routes/,navigation/,types/}, tests/, specs/component.spec.json
  etc/        # sdkwork.deployment.config.json + browser/runtime-env.<profile>.<env>.json
  config/     # browser/host examples
  tests/      # app-root integration tests (route alignment, architecture)
  specs/      # component.spec.json (h5-app-root)
```

Repository root layout and intentionally absent directories are listed in the root `README.md`.

## 5. API, SDK, And Data Ownership

Phase 1 owns no application HTTP contracts. Domain data (app catalog, contacts, generated apps, tasks, session) is owned by the `whatseek` context and served by mock clients persisted to localStorage behind interfaces in each capability package's `services/` (client injected from core). Future SDK families (`sdkwork-whatseek-app-sdk`, platform clients) will be declared in `contracts.sdkDependencies` and wired only through `src/bootstrap/sdkClients.ts`.

The messages and contacts capabilities integrate the sdkwork-im dependency family since 2026-10-03 (first landed SDK family, APP_SDK_INTEGRATION_SPEC.md §1/§9): the H5 app shell bootstrap constructs one composed `@sdkwork/im-sdk` client (`/im/v3/api`, `protected-open-api-api-key-or-dual-token`) with one shared `TokenManager` when the runtime environment declares `sdkworkImApiBaseUrl` (`etc/browser/runtime-env.*.json`; empty in all standalone profiles), and injects it into the `createImMessagesClient` adapter in `sdkwork-whatseek-h5-messages` (IM conversations/messages/read cursors → `MessagesPort`, CCP realtime → optional `MessagesPort.events`) and the `createImContactsClient` adapter in `sdkwork-whatseek-h5-contacts` (IM social contact views → `ContactsPort`). Without the base URL both ports stay on the mock clients, so standalone delivery and the other four surfaces are unaffected. Sibling SDK packages (`sdkwork-im`, `sdkwork-sdk-commons`, `sdkwork-utils`) are workspace members consumed via `workspace:*` and declared as CI git-dependency checkouts in `sdkwork.workflow.json`.

## 6. Security, Privacy, And Observability

- No secrets in source or `etc/`; `.env` files carry no tokens; runtime env (`/runtime-env.json`) declares profile identity and same-origin base URLs only (`SOURCE_CONFIG_SPEC.md`, `ENVIRONMENT_SPEC.md`).
- Session token (mock) lives in the core session store, never in UI state components; logout clears storage and caches.
- High-risk AI actions (send message) require explicit user confirmation before execution (PRD §28/§40).
- Observability: Phase 1 ships structured console logging only; platform observability lands with Phase 2 wiring (`OBSERVABILITY_SPEC.md`).

## 7. Deployment And Runtime Topology

Standalone browser delivery only in Phase 1. Deployment profiles: `standalone.development` (default) through `standalone.production` (10-profile index declared; browser runtime-env files materialized per build). Vite mode = `<profile>.<environment>`; build output `dist/<profile>/<dev|test|staging|prod>/`. Same-origin root `/` for all SDK base URLs, `browserOriginMode: same-origin`. Cloud profile wiring (edge origins) is deferred to Phase 2 and marked `supportedDeploymentProfiles: ["standalone"]`.

## 8. Architecture Decision Index

- ADR-0001 (planned): frontend-only standalone milestone with mock service ports instead of early platform SDK wiring.
- ADR-0002 (planned): package split — reserved roles (core/commons/shell) + one package per bottom tab capability.

## 9. Verification

```bash
pnpm typecheck && pnpm test && pnpm build:h5:dev
node ../sdkwork-specs/tools/audit-repository-baseline.mjs --root .
node ../sdkwork-specs/tools/check-workspace-layout.mjs --root .
node ../sdkwork-specs/tools/check-apps-directory-index.mjs --root .
node ../sdkwork-specs/tools/check-repository-docs-standard.mjs --root .
node ../sdkwork-specs/tools/check-browser-build-scripts.mjs --root .
node ../sdkwork-specs/tools/check-browser-dist-layout.mjs --root apps/sdkwork-whatseek-h5
node ../sdkwork-specs/tools/check-source-config-standard.mjs --root apps/sdkwork-whatseek-h5
node ../sdkwork-specs/tools/check-app-manifest-standard.mjs --root .
node ../sdkwork-specs/tools/check-component-port-bindings.mjs --root .
```
