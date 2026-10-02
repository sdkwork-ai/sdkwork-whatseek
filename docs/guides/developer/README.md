# Developer Guide

Local setup, verification, and contribution workflow for the WhatSeek
multi-surface repository.

## Toolchain

- Node.js 24 + pnpm 12 (workspace scripts assume both; `pnpm install` first).
- Flutter 3.47 / Dart 3.13 (Flutter surface only; pub mirror flutter-io.cn
  preconfigured).
- Rust stable, windows-gnu host (desktop surface only).

## Verification gates

```bash
pnpm verify          # the one gate: check (12 spec validators) + typecheck + test + build:h5:prod
pnpm check           # spec validators only
pnpm typecheck       # TypeScript strict, all workspaces
pnpm test            # all workspace test suites
```

Per-surface gates and artifact locations live in
[../runbooks/RUNBOOK-multi-surface-operations.md](../runbooks/RUNBOOK-multi-surface-operations.md).

## Where things live

- `apps/sdkwork-whatseek-common/` — the shared family (route-core,
  intent-core, service-core). The **only** cross-surface seam; changes here
  require re-running every surface gate.
- `apps/sdkwork-whatseek-h5|pc|mini-program|flutter-mobile/` — the four
  renderings. Each app root owns its shell, capability packages, bootstrap,
  and surface-local verification.
- Capability packages own screens/services/state/i18n/routes; the shell owns
  navigation chrome; core owns composition. UI never constructs SDK clients
  or HTTP directly (see `../sdkwork-specs/FRONTEND_CODE_SPEC.md`).

## Task-type entrypoints

`AGENTS.md` §Required Specs By Task Type maps each task type to its governing
spec. Read the task's specs before writing code — specs are the source of
truth, this guide is only a router.

## Development venue

Development happens on `main` directly
(`../sdkwork-specs/REPOSITORY_BASELINE_SPEC.md`). Human review is required
before landing breaking contracts, security-sensitive changes, deletions of
generated/shared assets, and release/publish actions
(`../sdkwork-specs/CODE_REVIEW_SPEC.md`).
