# Repository Guidelines — apps/sdkwork-whatseek-common

## SDKWORK Soul

Agent execution follows `../../../sdkwork-specs/SOUL.md`: specs before memory, dictionary before context, evidence before completion, stop on ambiguity.

## SDKWORK Standards

Global authority: `../../../sdkwork-specs/README.md`, `../../../sdkwork-specs/AGENTS_SPEC.md`. This root follows `../../../sdkwork-specs/APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` (shared package-family root) and `APPLICATION_SPEC.md`/`MODULE_SPEC.md`.

## Application Identity

Shared package family `sdkwork-whatseek-common` — not a runnable client surface. Owns cross-architecture contracts, service ports, and domain logic with no UI runtime dependency.

## Local Dictionary Structure

- `packages/sdkwork-whatseek-route-core/` — route identity contract shared by every client surface.
- `packages/sdkwork-whatseek-intent-core/` — PRD §10.1 intent recognition shared by chat capabilities.
- Packages MUST NOT import surface UI implementations; surface packages MUST NOT import each other.

## Spec Resolution Order

Use dynamic progressive loading: read this file, then the task row in `../../../sdkwork-specs/README.md`, then only selected standards; implementation files last. Language-specific specs are on-demand only.

## Required Specs By Task Type

- Package changes: `../../../sdkwork-specs/COMPONENT_SPEC.md`, `../../../sdkwork-specs/MODULE_SPEC.md`, `../../../sdkwork-specs/TYPESCRIPT_CODE_SPEC.md` (on-demand only), `../../../sdkwork-specs/NAMING_SPEC.md`
- Route identity changes: `../../../sdkwork-specs/APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`

## Code Style Rules

TypeScript strict family; public exports stay at `src/index.ts`; no UI framework, no DOM, no `window`/`document` access — pure framework-agnostic logic only.

## Build, Test, and Verification

```bash
pnpm --filter @sdkwork/whatseek-route-core typecheck && pnpm --filter @sdkwork/whatseek-route-core test
pnpm --filter @sdkwork/whatseek-intent-core typecheck && pnpm --filter @sdkwork/whatseek-intent-core test
node ../../../sdkwork-specs/tools/check-workspace-packages-layout.mjs --root . --mode enforce
```

## Agent Execution Rules

Follow `../../../sdkwork-specs/SOUL.md`; develop on `main`; capture verification evidence before claiming completion.

## Human Review Rules

Human review before landing: contract changes (they propagate to every client surface), new packages, dependency additions.

## Main-Branch Development

Authority: `../../../sdkwork-specs/REPOSITORY_BASELINE_SPEC.md`. Develop on `main` directly.
