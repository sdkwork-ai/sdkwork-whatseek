---
id: REQ-2026-0005
title: Multi-surface delivery — PC + desktop, WeChat mini-program, and Flutter mobile off one shared service core
owner: sdkwork-whatseek team
status: implemented
priority: P0
affected_surfaces: [h5, pc, mini-program, flutter]
trace:
  prd: docs/product/prd/PRD.md
  specs:
    - APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md
    - APP_PC_ARCHITECTURE_SPEC.md
    - APP_PC_REACT_UI_SPEC.md
    - MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md
    - FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC.md
---

# REQ-2026-0005 — Multi-Surface Delivery Off One Shared Service Core

## Goals

- One shared package family (`apps/sdkwork-whatseek-common`: route-core, intent-core, service-core) owns the cross-architecture contracts and domain logic; surfaces never import each other's UI implementations (APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md).
- All five renderings (H5, PC browser, Tauri desktop shell, WeChat mini-program, Flutter mobile) present the same five tabs (对话/应用/通讯录/消息/我的) and the same P0 flows: chat-first entry, intent-routed replies, app center with 我的应用, contacts, unified messages, profile.
- Route ids are the alignment contract: exactly 13 identities (`app.whatseek.<capability>.<screen>`) pinned by alignment tests on every TS surface and the Dart route table.
- Each surface verifies with its own toolchain: vitest + canonical browser builds (H5/PC), esbuild + node contract tests (mini-program), `flutter analyze`/`flutter test` (Flutter), `cargo build` (desktop host).

## Non-Goals

- Real backend wiring (Phase 2), native app-store packaging for Flutter (APK/IPA pipelines), macOS/Linux desktop host packaging (Windows shell first).

## Acceptance Criteria

1. `pnpm typecheck` 0 errors and `pnpm -r test` all suites green (common 41, H5, PC, profile/shell/contacts/messages).
2. `pnpm build:h5:prod` and `pnpm build:pc:prod` PASS via the canonical browser build runner.
3. Mini-program: `tsc` 0 errors, runtime bundle builds for standalone.production, contract suite 8/8 (manifest + 13-route page projection, page quads, facade + error-state coverage, dark-mode theme wiring, runtime freshness, wx host-adapter boundary, route ids, i18n key parity).
4. Flutter: `flutter analyze` No issues found, `flutter test` all green (33 tests) including the cross-surface route alignment test with a builder for every one of the 13 route ids, i18n layout compliance, settings screen, and the runner permission-denied state.
5. Desktop: `cargo build` produces `sdkwork-whatseek-pc-tauri.exe`; smoke test launches and terminates.
6. `pnpm check` (12 sdkwork-specs validators) green.

## Commercial-Delivery Closeout (2026-10-02)

After the P0 milestone, the surface-gap audit closed the remaining functional deltas so every surface covers the full 13-route contract:

- Mini-program: dedicated pages for `apps.search`, `apps.runner`, `apps.create`, `apps.my`, `contacts.detail`, `profile.settings` (13/13 route ids addressable), real favorite/publish/delete/direct-conversation interactions, per-page loading/empty/error+retry states, task-state chip in chat, native dark mode (`darkmode` + `theme.json` + token overrides).
- Flutter: `AppsSearchScreen`, `SettingsScreen`, real `AppRunnerScreen` replace the placeholder; all 8 secondary routes have builders; zh-CN/en-US i18n fragments per package under `lib/src/i18n/`; light/dark `ThemeData` + persisted appearance (shared_preferences); settings and search entries on the profile/apps tab roots.
- Shared catalog: `crm-manager` is the `enterprise`-kind app, making the documented visitor permission-denied runner state reachable on all four surfaces (previously dead code on H5/PC).

## Visual Acceptance (2026-10-03)

Rendered-surface acceptance against the standalone.production bundles (browser harness; mobile 390×844 for H5, desktop 1440×900 for PC):

- H5: all 13 routes rendered and exercised — chat suggestion→card flow, runner success preview, enterprise visitor permission-denied state, contacts filter/list→detail→发消息→direct conversation→send (unread badge decrements live), profile asset summary, apps home with recorded recents, create/my-apps, and persisted dark mode + en-US locale.
- PC: desktop nav-rail shell, wide app center (categories/recents/hot), and the permission-denied state.
- Mini-program: covered by the 9-test contract suite (page quads, facade boundary, states, refresh, dark-mode wiring) — WeChat DevTools rendering is outside this environment's reach and remains the pre-store smoke step.
- Follow-up fix from acceptance: the lazy-route Suspense fallback no longer shows the chat title on every route (generic loading copy).

## Verification

```bash
pnpm typecheck && pnpm -r test && pnpm check
pnpm build:h5:prod && pnpm build:pc:prod
cd apps/sdkwork-whatseek-mini-program && pnpm typecheck && pnpm build:mini-program:prod && pnpm test
cd apps/sdkwork-whatseek-flutter-mobile && flutter analyze && flutter test
cd apps/sdkwork-whatseek-pc/packages/sdkwork-whatseek-pc-tauri/src-tauri && cargo build
```
