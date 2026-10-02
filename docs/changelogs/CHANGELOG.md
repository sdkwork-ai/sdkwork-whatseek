# Changelog

All notable changes to the WhatSeek application repository. Format follows
`DOCUMENTATION_SPEC.md` §9; release entries additionally follow `RELEASE_SPEC.md`.

## Unreleased

### 2026-10-03 — Spec hardening + rendered-surface visual acceptance

- **Mini-program** (APP_MINI_PROGRAM_UI_SPEC §7): pull-down refresh wired on
  the five list pages (apps / contacts / messages / apps-my / apps-search,
  silent refresh without loading flicker) and the creation form now shows a
  validation message for an empty requirement; contract suite 8 → 9 tests.
- **H5/PC**: the lazy-route Suspense fallback no longer hardcodes the chat
  title — ScreenState falls back to the generic per-state copy (加载中…) on
  every route.
- **Rendered visual acceptance** (browser, mobile 390×844 for H5, 1440×900
  for PC, against the standalone.production bundles): H5 verified all 13
  routes plus the chat suggestion→card flow, runner success, the enterprise
  visitor permission-denied state, contacts→detail→direct
  conversation→send with the live unread-badge decrement, profile asset
  summary, and persisted dark mode + en-US; PC verified the desktop nav-rail
  shell, the wide app center, and the permission-denied state. Playwright
  locator clicks hang on this app's React tree — the acceptance harness used
  coordinate/evaluate clicks; the conversation composer's Enter-to-send is a
  harness event-dispatch quirk (form semantics verified in code), not an app
  defect.

### 2026-10-02 — Commercial-delivery closeout: full 13-route coverage on every surface

- **Mini-program** (`apps/sdkwork-whatseek-mini-program`): added the six missing
  detail-subpackage pages (`apps-search`, `apps-runner`, `apps-create`,
  `apps-my`, `contact-detail`, `settings`) so all 13 cross-surface route ids
  are addressable; real favorite/publish/delete/direct-conversation/task-state
  interactions through the extended runtime facade; loading/empty/error+retry
  states on every page; native dark mode via `darkmode` + `theme.json` +
  token overrides. Contract suite extended from 5 to 8 tests.
- **Flutter** (`apps/sdkwork-whatseek-flutter-mobile`): new `AppsSearchScreen`,
  `SettingsScreen`, and a real `AppRunnerScreen` replace the placeholder host;
  all 8 secondary routes wired; per-package zh-CN/en-US i18n fragments under
  `lib/src/i18n/<locale>/whatseek/<capability>/` with a namespaced-key
  resolver; light/dark `ThemeData` with persisted appearance and locale
  (`shared_preferences`). Test count 15 → 33.
- **Shared service family** (`apps/sdkwork-whatseek-common`): `crm-manager` in
  the mock catalog is now the `enterprise`-kind app, making the documented
  visitor permission-denied runner state reachable on H5/PC/mini-program/
  Flutter (previously unreachable on every surface). No generated contract
  changed; no test pinned the previous kind.
- Verification: `pnpm check` (12 validators) green, `pnpm typecheck` 0 errors,
  `pnpm -r test` green, `pnpm build:h5:prod`/`pnpm build:pc:prod` PASS,
  mini-program prod build + 8/8 contract tests green, `flutter analyze` 0
  issues + `flutter test` 33/33, desktop `cargo build` produces
  `sdkwork-whatseek-pc-tauri.exe`. Evidence: REQ-2026-0005
  (`docs/product/requirements/REQ-2026-0005-whatseek-multi-surface.md`).
