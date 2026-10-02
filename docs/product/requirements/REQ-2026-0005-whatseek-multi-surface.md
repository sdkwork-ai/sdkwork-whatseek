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
3. Mini-program: `tsc` 0 errors, runtime bundle builds for standalone.production, contract suite 5/5 (manifest alignment, page quads, runtime freshness, wx host-adapter boundary).
4. Flutter: `flutter analyze` No issues found, `flutter test` 15/15 including the cross-surface route alignment test.
5. Desktop: `cargo build` produces `sdkwork-whatseek-pc-tauri.exe`; smoke test launches and terminates.
6. `pnpm check` (12 sdkwork-specs validators) green.

## Verification

```bash
pnpm typecheck && pnpm -r test && pnpm check
pnpm build:h5:prod && pnpm build:pc:prod
cd apps/sdkwork-whatseek-mini-program && pnpm typecheck && pnpm build:mini-program:prod && pnpm test
cd apps/sdkwork-whatseek-flutter-mobile && flutter analyze && flutter test
cd apps/sdkwork-whatseek-pc/packages/sdkwork-whatseek-pc-tauri/src-tauri && cargo build
```
