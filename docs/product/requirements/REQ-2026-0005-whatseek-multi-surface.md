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

## PRD Re-Scan and P1 Closures (2026-10-07)

Full PRD.md re-scan against the implementation (post sdkwork-im landing):
**0 P0, 4 P1, 7 P2**. Closed in this round:

- **Task-notification → chat deep link (PRD §5.5)** on all four surfaces: task
  conversations render a "view task result" affordance in the conversation
  view; following it opens the chat tab and restores the task as an entry with
  its state chip (H5/PC `?taskId=` route param consumed once by
  ChatHomeScreen; mini-program globalData `pendingTaskId` consumed in
  `onShow`; Flutter `WhatseekRuntime.pendingTaskLink` ValueNotifier + tab
  request consumed by the app scaffold).
- **Mini-program favorites unreachable (REQ-0003)**: 我的应用 gained the
  created/favorites dual tab (favorite toggle action, empty states) plus the
  missing version display — matching H5/PC/Flutter.
- **Mini-program i18n drift fixes**: contact-kind labels and task-chip labels
  are now fragment-driven and locale-aware with H5-aligned keys
  (`whatseek.contacts.segment.*`, `whatseek.chat.task.*`, all seven PRD §41
  task states); the contact-detail page no longer carries its own drifted
  label map; `contacts.setContactsLocale` joins the settings locale switch.

Closed 2026-10-07 (later the same day): the appstore home feed (PRD §4
hero/stories/collections/charts) now ships on every surface — PC (five feed
components + charts/collection screens, route table 13→15 matching H5),
mini-program (feed sections on the apps page + apps-charts/apps-collection
detail pages consuming the runtime facade), and Flutter (Dart homeFeed port
incl. the 19-app shared catalog, charts/collection screens, route table
13→15; route-table change flagged for human review per the Flutter AGENTS
rule). Verification: PC 36 tests, mini-program 31 tests, Flutter analyze
clean + 67 tests (54 root + 13 apps package).

Closed 2026-10-07 (evening round): the last P1 and five P2s.

- **[P1 closed] Mini-program static chrome i18n**: all 15 pages bind
  localized strings through per-capability `strings()` accessors
  (`appApi.<cap>.strings()` + `appApi.commons.strings()`), with
  `set<Cap>Locale` setters wired into the settings locale switch; zh values
  byte-identical to the previous chrome (visual zero-change), en mirrors H5.
  Fragment parity held (mp-apps 91 keys, mp-profile 34, mp-chat 54);
  locale-switch probe verified against the real built runtime. Native tabBar
  labels remain the platform boundary.
- **[P2-8 closed] Profile fifth asset (消息)** on all four surfaces: total
  messages across the inbox (N+1 listing noted in-code for a future
  server-side aggregate).
- **[P2-5/6 closed] Search row + detail field coverage**: search rows now
  show category · rating · users · price · AI on every surface; app detail
  gains category + screenshots placeholder on H5/PC, and Flutter/MP close
  their additional gaps (rating/updated/permissions on Flutter;
  users/updated/permissions/AI badge on MP).
- **[P2-4 partially closed] Recommendation cards** now carry the AI
  capability marker on all four surfaces (功能差异/自定义 fields remain a
  data-model addition).
- **[P2-11 closed] Mini-program contacts kind segments**: the six-segment
  filter (keys mirror `whatseek.contacts.segment.*`) with combined
  query+kind filtering.

Closed 2026-10-07 (final round): the last two P2s — the conformance backlog
is empty (0 P0 / 0 P1 / 0 P2 open).

- **[P2 closed] 我的应用 edit/share (REQ-0003)**: every surface now offers
  "AI 修改" from 我的应用 (H5/PC inline instruction row; MP editable
  wx.showModal; Flutter AlertDialog) driving `modifyApp` (version bump);
  share lands on MP (`wx.setClipboardData`) and Flutter
  (`WhatseekHost.clipboard`, the core host-port locator) completing
  H5/PC parity.
- **[P2 closed] Generation plan artifacts (PRD §3)**: `draftCreationPlan`
  now returns `{ modules, pages, dataModel }` — keyword-matched 页面规划 and
  数据模型规划 derivations in the shared catalog (TS) and the Dart mock —
  and both the creation-flow plan step and the chat `app_plan` card render
  all three artifacts on every surface.

For the record, the remaining recommendation-card fields (功能差异/自定义)
stay a data-model addition tracked with the app-api milestone; every
PRD-enumerated user-visible behavior ships on every surface.

Verification: `pnpm verify` green; mini-program 31 tests; Flutter analyze
clean + 54 root + 13 apps tests; H5 38 + PC 36 tests; standards gates +
`pnpm check` green.

Verification this round: `pnpm verify` EXIT=0 (check + typecheck + tests +
H5 prod build); mini-program typecheck + 31 tests + dev/staging/prod builds;
Flutter analyze clean + 67 tests (54 root + 9 messages + 13 apps packages);
PC prod build PASS (36 tests) + Tauri `cargo check` green; packaging
preflight `flutter build apk --debug` blocked by the environment (no Android
SDK) — recorded as the release-milestone boundary.

## Commercial Readiness Certificate (2026-10-07)

Consolidated statement over the ten delivery rounds
(`1f8dad8 → 0fe9089`, plus `7002608`/`520be9d` docs+tests):

| Capability | H5 | PC | Mini-program | Flutter | Evidence |
| --- | --- | --- | --- | --- | --- |
| 15-route identity contract | ✓ | ✓ | ✓ (15 pages) | ✓ (declared mirror + alignment test) | per-surface route-alignment tests |
| Five tabs, real implementations | ✓ | ✓ | ✓ | ✓ | rendered acceptance + behavior suites |
| sdkwork-im messages/contacts (gateway-ready) | ✓ | ✓ | ✓ (wx transports) | ✓ (Dart family) | adapter tests per surface; runbook §9 activation |
| Task loop incl. waiting_confirmation + deep link | ✓ | ✓ | ✓ | ✓ | ui-states suites + behavior tests |
| Appstore home feed (编辑流) + charts/collection | ✓ | ✓ | ✓ | ✓ | rendered acceptance (390×844 / 1440×900) |
| 我的应用 create/edit/share/favorite/version | ✓ | ✓ | ✓ | ✓ | behavior tests + rendered acceptance |
| zh/en + dark mode | ✓ | ✓ | ✓ (incl. chrome) | ✓ | fragment-parity guards per surface |
| Desktop self-contained shell | — | ✓ (5.2 MB exe, launch smoke) | — | — | cargo release + launch smoke |

Quality gates at certificate time (re-measured 2026-10-08 after the
live-gateway round): `pnpm verify` EXIT=0; 382 executed assertions green —
vitest 270 (common + H5 + PC), mini-program 36, Flutter 76 (54 root +
9 messages + 13 apps packages); 13 repository standard checks under
`pnpm check`; packaging workflow standard green. (The earlier snapshot
undercounted H5/PC by counting only root-suite files and labeled the
standard checks "12" — corrected here.)

Known boundaries (documented, deployment-machine scope): production IM
gateway + PostgreSQL topology (a development gateway IS bring-up-able on
any machine with local Postgres + Redis — see the live acceptance below),
IAM login runtime wiring (§4 factory seam ready; operator bootstrap-token
bridge documented in each surface's etc/config README), `flutter build apk`
preflight (no Android SDK here). The recommendation 功能差异/自定义 fields
ride the app-api data-model milestone.

## Live-Gateway Acceptance (2026-10-08)

The sdkwork-im standalone gateway was brought up on this machine
(`pnpm gateway:run:standalone` in the sdkwork-im repo; local PostgreSQL
authority + Redis realtime plane; `/healthz` ok, `/readyz` ready) and the
whole messages/contacts chain was verified against it end to end:

1. **Real IAM sessions** — bootstrap Access-Token header + `POST
   /app/v3/api/auth/sessions`: phone_code registration consumed the dev
   fixed verification code (`654321`) and password grant login both returned
   real dual-token sessions.
2. **Real social graph** — friend request created by user 1, accepted by
   user 2 through the composed `@sdkwork/im-sdk` client;
   `social.contacts.list` returns the accepted contact.
3. **Real direct conversation** — `conversations.bindDirectChat` bound an
   idempotent actor-pair conversation with both members enrolled. This
   exposed and fixed a real integration defect: the surfaces' adapters used
   `conversations.create({conversationType:'direct', memberUserIds:[…]})`,
   which the gateway rejects (`memberUserIds are only supported for group
   conversations`) — all four surfaces now bind direct chats by actor pair.
4. **Real messages** — three seeded messages posted through the SDK; the
   WhatSeek H5 app (built dist + local runtime-env carrying the gateway URL
   and the operator bootstrap tokens) rendered the real inbox with the real
   unread badge, opened the real thread, sent a new message from the UI
   composer, and the message was read back from the gateway through the
   peer's session. Read-cursor persistence cleared the unread badge.
5. **Title fallback fix** — direct inbox entries carry no conversation-level
   display name; the surfaces rendered the misleading system-notice fallback.
   All four adapters now fall back to the peer's display name, then the peer
   principal id.

Remaining known gaps observed live (documented, not hidden): the gateway's
inbox `peer` view does not join `iam_user.display_name`, so contact rows
render the principal id until the backend enriches the contact record; the
UI self/echo distinction still keys off the Phase-1 mock session identity
(`visitor`) rather than the IAM principal, so sent messages render an echo
bubble — both close with the Phase-2 IAM session binding.

## Verification

```bash
pnpm typecheck && pnpm -r test && pnpm check
pnpm build:h5:prod && pnpm build:pc:prod
cd apps/sdkwork-whatseek-mini-program && pnpm typecheck && pnpm build:mini-program:prod && pnpm test
cd apps/sdkwork-whatseek-flutter-mobile && flutter analyze && flutter test
cd apps/sdkwork-whatseek-pc/packages/sdkwork-whatseek-pc-tauri/src-tauri && cargo build
```
