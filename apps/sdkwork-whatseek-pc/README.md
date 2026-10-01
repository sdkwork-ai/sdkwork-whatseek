# WhatSeek PC (问寻)

Desktop-class PC surface of WhatSeek, the AI-native super application. Five navigation-rail destinations: 对话 (Chat, the AI entry) ｜ 应用 (App center) ｜ 通讯录 (Contacts) ｜ 消息 (Messages) ｜ 我的 (Profile).

## Layout

- `src/` — thin root: `main.tsx`, `App.tsx`, `AuthGate.tsx`, `index.css` (theme bootstrap), `bootstrap/` (environment, SDK clients, routes), `shell/` (ownership shim).
- `packages/` — architecture-local workspace packages: `sdkwork-whatseek-pc-core` (composition root), `-commons`, `-shell` (desktop navigation rail), and one capability package per tab (`-chat`, `-apps`, `-contacts`, `-messages`, `-profile`).
- `etc/` — source config index + standalone browser runtime-env profiles.
- `tests/` — route alignment, H5 architecture contract, UI state integration tests.

## Commands

```bash
pnpm dev            # vite dev server (standalone.development, port 3200)
pnpm test           # vitest (jsdom)
pnpm typecheck      # tsc --noEmit
pnpm build:dev      # canonical build -> dist/standalone/dev
pnpm build:prod     # canonical build -> dist/standalone/prod
```

## Standards

Agent entrypoint: `AGENTS.md`. Canonical specs: `../../../sdkwork-specs/APP_H5_ARCHITECTURE_SPEC.md`, `APP_MOBILE_REACT_UI_SPEC.md`, `FRONTEND_CODE_SPEC.md`, `THEME_DARKMODE_SPEC.md`, `I18N_SPEC.md`.
