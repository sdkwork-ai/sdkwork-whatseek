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
3. Mini-program: `tsc` 0 errors, runtime bundle builds for standalone.production, test suite 25/25 — 9 contract tests (manifest + 13-route page projection, page quads, facade + error-state coverage, dark-mode theme wiring, runtime freshness, wx host-adapter boundary, route ids, i18n key parity) plus 15 page-behavior smoke tests that drive the real native page modules against the real bundled runtime in a simulated WeChat host (loads, states, navigation, favorite/publish/delete/send/task flows, the waiting_confirmation park with user confirm/cancel, the session loop (sign-in opens the enterprise app), validation and pull-down refresh).
4. Flutter: `flutter analyze` No issues found, `flutter test` all green (54 tests) including the cross-surface route alignment test with a builder for every one of the 13 route ids, i18n layout compliance, settings screen, the runner permission-denied state, the full-intent chat router (agent dispatch, commerce cards), the task confirmation/cancel loop, and the profile sign-in/out session loop.
5. Desktop: `pnpm build:desktop` (PC prod bundle + `cargo build --release`) produces the self-contained `sdkwork-whatseek-pc-tauri.exe`; smoke test launches and terminates.
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

## Desktop Launch Smoke (2026-10-03)

`target/release/sdkwork-whatseek-pc-tauri.exe` launched as a real process:
window `WhatSeek 问寻` created and stayed alive (pid observed), then
terminated cleanly. Fulfills acceptance criterion 5's launch-and-terminate
requirement with direct evidence.

## Rendered Acceptance of the PRD-Conformance Round (2026-10-03)

Browser acceptance of the round's new behavior against the rebuilt
standalone.production bundles (H5 390×844; PC 1440×900):

- H5 chat: `让智能体帮我整理日报` renders the dispatch copy with three agent
  roster cards (行业新闻整理 Agent / 跨境选品 Agent / 问寻 AI 助手);
  content-creation utterances render the task chip and it advances live
  through pending → running → waiting_confirmation → completed
  (`data-task-state` observed across the transition), landing message-center
  notifications (unread badge increments).
- H5 messages: `titleKey` conversations render localized titles (系统通知 /
  AI 任务) alongside the new app-notification conversation.
- H5 profile: four-column asset card (对话 / 应用 / Agent / 联系人).
- PC: messages parity confirmed (localized titles, 7 conversations); profile
  initially still rendered the three-column card — the PC twin screen had not
  received the agents column — fixed in this round and re-verified
  (4 columns: 7 对话 / 0 应用 / 3 Agent / 11 联系人).

## Rendered Acceptance of the Task-Confirmation Round (2026-10-03)

Browser acceptance of the PRD §41 confirmation loop against the rebuilt
standalone.production bundles (H5 390×844; PC 1440×900):

- H5 chat: `帮我做一张促销海报` parks the chip at 待确认 with 确认完成 /
  取消任务 actions rendered; 取消任务 resolves the chip to 已取消, appends
  the localized outcome bubble, and lands 「帮我做一张促销海报」已取消。 in
  the message center (unread badge 4 → 5). A second task resolves through
  确认完成 to 已完成 with 「帮我写一篇新年文案」已完成。 (badge 5 → 6).
- Reload reconciliation (found during acceptance): restored threads rendered
  every historical chip as 排队中 because `activeTaskStates` is runtime-only;
  both H5 and PC now reconcile chip states from the tasks client on mount
  (verified: chips read 已取消/已完成 after reload; pinned by a ui-states
  test on both surfaces).
- en-US + dark mode: reply copy, chip labels, and action buttons all
  localize (Got it!… / Cancelled / Completed / Cancel task); persistence
  intact.
- PC: desktop nav-rail shell renders the same park → cancel → confirm flow
  with unread badge increments (4 → 5 → 6) and the wide-layout bubbles.

## Rendered Acceptance of the Session-Loop and Tech-Blue Rounds (2026-10-03)

- Session loop: the H5 visitor deep route `/apps/runner/crm-manager` renders
  the genuine permission-denied state; after profile sign-in the session
  card flips to 问寻用户 (已登录) with 退出登录, and the same loop is pinned
  by unit tests on H5/PC (denied → sign-in → sandbox preview), the
  mini-program behavior suite, and Flutter widget tests. Mock sessions are
  in-memory by design (Phase 1 用户体系); a full page reload returns to the
  visitor identity until IAM lands in Phase 2.
- Tech blue + full-bleed lists: rebuilt production bundles screenshot-verified
  on H5 390×844 (消息 / 应用 / 通讯录 / 我的 all edge-to-edge with hairline
  rules, vivid #1677ff brand, no visible scrollbars) and PC 1440×900 (desktop
  shell on the new brand, layout intact).

## Conformance Record (2026-10-03)

- Spec conformance audit (route contract, five UI states, i18n, architecture
  boundaries, package layout, naming, test evidence, HTTP/int64 posture,
  manifests, documentation): ten checks, zero MUST-level violations
  (`docs/changelogs/CHANGELOG.md` 2026-10-03 entry). Follow-up: PC gained the
  H5-twin five-state render suite (63 → 71 tests).
- CI packaging entrypoint (`.github/workflows/package.yml` → reusable
  `sdkwork-github-workflow`) has existed since the initial commit; the
  framework ref is pinned to a commit SHA (no framework release tags exist
  yet). No change required.

## Verification

```bash
pnpm typecheck && pnpm -r test && pnpm check
pnpm build:h5:prod && pnpm build:pc:prod
cd apps/sdkwork-whatseek-mini-program && pnpm typecheck && pnpm build:mini-program:prod && pnpm test
cd apps/sdkwork-whatseek-flutter-mobile && flutter analyze && flutter test
cd apps/sdkwork-whatseek-pc/packages/sdkwork-whatseek-pc-tauri/src-tauri && cargo build
```
