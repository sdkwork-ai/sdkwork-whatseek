# WhatSeek Mini Program (问寻)

Native WeChat mini-program client of WhatSeek. Five tabBar pages map 1:1 to the cross-surface tabs (对话 Chat ｜ 应用 Apps ｜ 通讯录 Contacts ｜ 消息 Messages ｜ 我的 Profile); detail screens ship in the `detail` subpackage.

## Layout

- `packages/sdkwork-whatseek-mp-*` — TypeScript capability packages consuming the shared common service family (`@sdkwork/whatseek-service-core` et al.). `wx.*` is touched only in `src/bootstrap/runtime.ts` through a typed host adapter port.
- `src/pages/` + `src/detail/` — native pages projected from the route identities; `src/app.json` declares tabBar + subpackage.
- `src/runtime/` — committed esbuild bundle of the bootstrap runtime (CJS, platform neutral) built by `scripts/build-runtime.mjs`.

## Commands

```bash
pnpm install                  # from the repository root
pnpm typecheck                # tsc --noEmit
pnpm build                    # bundle runtime for standalone.development
pnpm build:mini-program:prod  # bundle runtime for standalone.production
pnpm test                     # surface contract tests (node --test)
```

Then open the WeChat DevTools with `miniprogramRoot=src/` (see `project.config.json`).

## Standards

Agent entrypoint: `AGENTS.md`. Canonical specs: `MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md`, `APP_MINI_PROGRAM_UI_SPEC.md`, `APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`.
