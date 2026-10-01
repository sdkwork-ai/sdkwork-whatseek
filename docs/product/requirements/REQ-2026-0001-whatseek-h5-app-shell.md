---
id: REQ-2026-0001
title: WhatSeek H5 five-tab app shell with chat-first home
owner: sdkwork-whatseek team
status: implemented
priority: P0
affected_surfaces: [h5]
trace:
  prd: docs/product/prd/PRD.md
  specs:
    - APP_H5_ARCHITECTURE_SPEC.md
    - APP_MOBILE_REACT_UI_SPEC.md
    - THEME_DARKMODE_SPEC.md
    - I18N_SPEC.md
    - FRONTEND_CODE_SPEC.md
---

# REQ-2026-0001 — WhatSeek H5 Five-Tab App Shell With Chat-First Home

## Goals

- Bottom navigation fixed to exactly five tabs: 对话 (Chat) ｜ 应用 (Apps) ｜ 通讯录 (Contacts) ｜ 消息 (Messages) ｜ 我的 (Profile); Chat is the default tab.
- Chat home opens on "你想做什么？告诉我就可以。" with a message input; no menu wall or content feed before expression.
- Mobile layout respects safe areas and centers content for phone-first touch usage.
- Theme: three-layer semantic tokens with light and dark values; dark mode via `data-sdk-color-mode` + `dark` class, no `prefers-color-scheme` reads in components; anti-flash boot script inline in `index.html`.
- i18n: zh-CN and en-US locales in per-package `src/i18n/<locale>/<domain>/<capability>/` fragments; UI strings resolved through i18next.

## Non-Goals

- Native shells (Capacitor/iOS/Android), PC surface, mini-program surface.
- Real backend session (mock session is acceptable in Phase 1).

## Acceptance Criteria

1. Route alignment test passes: every capability-declared route id `<surface>.<domain>.<capability>.<screen>` is mounted; no placeholders; tab paths presentation-only with i18n title keys.
2. Switching all five tabs renders each capability screen; deep links to a tab route select the correct tab.
3. Dark mode toggle in Profile switches `data-sdk-color-mode` and every visible surface uses dark tokens (no white flashes on reload).
4. Switching language zh-CN ↔ en-US re-renders tab labels and screen titles without reload.
5. `pnpm typecheck`, `pnpm test`, `pnpm build:h5:dev` pass.

## Verification

```bash
pnpm --filter @sdkwork/whatseek-h5-core test
pnpm typecheck && pnpm test && pnpm build:h5:dev
node ../sdkwork-specs/tools/check-apps-directory-index.mjs --root .
```
