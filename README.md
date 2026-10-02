# WhatSeek｜问寻

repository-kind: application

AI-native super application: a chat-first entry that connects apps, agents, people, and commerce, and creates apps on demand. Brand message: 你负责问，AI 负责寻 (You ask, AI seeks).

## Scope

This repository owns the `whatseek` bounded context: the WhatSeek AI-native super app product surface — AI chat entry with intent recognition and AI routing, the AI-native app center (discover, invoke, compose, create apps), contacts, unified messages, and the personal digital asset center (我的).

Out of scope: IAM/identity services, commerce order/payment processing, IM transport infrastructure, LLM inference gateways. This repository consumes those capabilities through platform SDK clients when wired; the current milestone ships the H5 surface with standalone mock-backed services.

## Application Identity

- Application code: `whatseek`
- Repository: `sdkwork-whatseek`
- Primary surface: `apps/sdkwork-whatseek-h5/` (mobile-first H5), aligned with the PC (browser + Tauri desktop), WeChat mini-program, and Flutter mobile surfaces
- Bottom navigation: 对话 (Chat) ｜ 应用 (Apps) ｜ 通讯录 (Contacts) ｜ 消息 (Messages) ｜ 我的 (Profile)

## Standard Layout

| Directory | Purpose |
| --- | --- |
| `apps/` | Application roots: `sdkwork-whatseek-common` (shared contracts/ports), `sdkwork-whatseek-h5` (primary mobile-first H5), `sdkwork-whatseek-pc` (desktop-class PC + Tauri desktop shell), `sdkwork-whatseek-mini-program` (WeChat), `sdkwork-whatseek-flutter-mobile` (iOS/Android). |
| `apis/` | API contracts (reserved; inactive). |
| `sdks/` | SDK families (reserved; inactive). |
| `crates/` | Generated API assembly scaffold only (`sdkwork-api-whatseek-assembly`, owned by `api:assembly:materialize`). |
| `etc/` | Deployable-root source config index. |
| `deployments/` | Deployment descriptors (reserved; inactive). |
| `scripts/` | Thin command entrypoints. |
| `docs/` | Canon documentation. |
| `tests/` | Cross-package verification (reserved; inactive). |
| `specs/` | Repository machine contracts. |
| `bin/` | Operator entrypoints (reserved; inactive). |
| `examples/` | Examples (reserved; inactive). |
| `tools/` | Repository-local tooling (reserved; inactive). |
| `plugins/` | Application plugins (reserved; inactive). |

Intentionally absent standard directories: `database/` (no owned persistence yet), `jobs/` (no owned scheduled jobs yet), `generated/` (no generated composition output yet), `tools/`/`examples/`/`plugins/`/`bin/` are reserved placeholders (see the layout table). These become fully owned when the corresponding capability is introduced.

## Canonical Names

- Domain: `whatseek`
- H5 app root: `apps/sdkwork-whatseek-h5/`
- H5 packages: `sdkwork-whatseek-h5-core`, `sdkwork-whatseek-h5-commons`, `sdkwork-whatseek-h5-shell`, `sdkwork-whatseek-h5-<capability>`
- PC packages: `sdkwork-whatseek-pc-<role>`; mini-program packages: `sdkwork-whatseek-mp-<capability>`; Flutter packages: `sdkwork_whatseek_flutter_mobile_<capability>`
- Shared (cross-architecture): `sdkwork-whatseek-route-core`, `sdkwork-whatseek-intent-core`, `sdkwork-whatseek-service-core` under `apps/sdkwork-whatseek-common/packages/`

## Documentation Canon

- [docs/README.md](docs/README.md) — documentation index
- [docs/product/prd/PRD.md](docs/product/prd/PRD.md) — product Canon entry
- [docs/architecture/tech/TECH_ARCHITECTURE.md](docs/architecture/tech/TECH_ARCHITECTURE.md) — technical architecture Canon entry

## Application Roots

See [apps/README.md](apps/README.md) for the governed application root index.

## Standards

Behavior follows the global standards at [../sdkwork-specs/README.md](../sdkwork-specs/README.md). Agent execution starts at [AGENTS.md](AGENTS.md). Key specs: `SDKWORK_WORKSPACE_SPEC.md`, `REPOSITORY_BASELINE_SPEC.md`, `APP_H5_ARCHITECTURE_SPEC.md`, `APP_MOBILE_REACT_UI_SPEC.md`, `COMPONENT_SPEC.md`, `PNPM_SCRIPT_SPEC.md`, `PNPM_WORKSPACE_DEPENDENCY_SPEC.md`, `THEME_DARKMODE_SPEC.md`, `I18N_SPEC.md`, `TEST_SPEC.md`.

## Local Development

```bash
pnpm install
pnpm dev            # standalone development (delegates to dev:standalone)
pnpm test           # vitest
pnpm typecheck      # tsc --noEmit across packages
pnpm build:h5:dev   # browser build -> dist/standalone/dev
```
