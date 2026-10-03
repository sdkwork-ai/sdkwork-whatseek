# Changelog

All notable changes to the WhatSeek application repository. Format follows
`DOCUMENTATION_SPEC.md` §9; release entries additionally follow `RELEASE_SPEC.md`.

## Unreleased

### 2026-10-03 — Tech-blue theme + full-bleed mobile lists + no visible scrollbars

- **科技蓝主题全端落地**: brand ramp moved from indigo-leaning blue-600 to the
  vivid tech-blue family (`#1677ff` primary / `#0958d9` hover, `#e6f4ff` soft)
  across H5/PC CSS ramps, mini-program tokens (`app.wxss` + `theme.json`
  tab/nav), and the Flutter `ColorScheme` seed. Dark-mode brand follows
  (`#4096ff`).
- **移动端滚动条隐藏** (H5): global `scrollbar-width: none` +
  `::-webkit-scrollbar { display: none }` — content scrolls, bars never show.
- **全出血列表改造** (消息/应用/通讯录/我的 + PC 同构): the shared `Card`
  drops its `mx-4 rounded-2xl` floating-box look for edge-to-edge sections
  with hairline top/bottom rules (native mobile list pattern); profile
  session card goes full-bleed; contacts/apps/messages lists sit flush to the
  screen edges. Mini-program `.panel` mirrors it (vertical margins only,
  square corners); Flutter tab lists keep their native full-bleed ListTiles
  with vertical-only root padding on profile.
- Verification: `pnpm verify` EXIT=0, H5/PC prod builds PASS, mp 25 tests,
  Flutter 54 tests, `flutter analyze` clean. Rendered acceptance screenshots
  (H5 390×844: 消息/应用/通讯录/我的 full-bleed + tech blue; PC 1440×900
  desktop shell on the new brand).

### 2026-10-03 — Session loop closes the enterprise gate on all four surfaces (P0 用户体系/基础权限)

- Mini-program gains the mock session model (mp-profile package:
  `getSessionUser`/`signIn`/`signOut`; profile summary reads the real
  session) plus 登录/退出登录 actions on the profile tab; the runner's
  enterprise check is now session-aware (`enterprise && visitor → denied`),
  so 管家 CRM denied → 登录 → open is a real loop (H5/PC authState parity).
  Behavior suite 24 → 25 tests.
- Flutter profile screen wires `WhatseekIamRuntime` (previously a dead
  in-memory model with no UI entry): injected `readSession`/`onSignIn`/
  `onSignOut` from the composition root, session card flips
  访客↔问寻用户 with localized actions; widget tests pin the loop
  (sign-in opens `crm-manager`, sign-out restores the gate). Tests 52 → 54;
  also fixed a latent `late _assets` initialization hazard on the profile
  screen.
- H5/PC: the runner deep route is pinned end-to-end by a new ui-states test
  (visitor denied → profile sign-in → same route renders the sandbox
  preview); rendered acceptance confirmed the visitor denial screen and the
  post-sign-in session card.

### 2026-10-03 — Task confirmation loop (PRD §41) + Flutter intent parity + mini-program reply localization fix

- **Task states become user-reachable on all four surfaces** (PRD §41 P0
  基础任务状态): content/execute/edit tasks now run pending → running →
  **waiting_confirmation and park** — the chat chip exposes 确认完成 / 取消任务
  actions; 确认 completes the task with a result summary and lands the
  message-center notification, 取消 moves it to `cancelled` with its own
  notification copy. `waiting_confirmation` tasks abandoned for 5 minutes
  lazily expire on read (`expired`). New `confirm_task`/`cancel_task` card
  actions in the shared ChatPort; the previously unreachable `cancelled`
  terminal state is now a real user path (H5/PC mirror screens, mini-program
  page actions, Flutter `_buildTaskChip` actions).
- **Flutter chat router brought to full PRD §10.1 intent parity**: the Dart
  port had drifted — it lacked `USE_AGENT` recognition (rule ordering vs
  `SEARCH_AGENT`), agent dispatch/roster/recommendation routing,
  `EXECUTE_TASK`/`EDIT_CONTENT` task flows, and product/service commerce
  result cards. All added off the shared rule shapes; send-message draft
  extraction (告诉他/说 body) ported too. Flutter tests 45 → 52.
- **Mini-program fix (user-visible P1)**: reply contentKeys are dotted
  (`whatseek.chat.reply.action.appGenerated`) while fragments carried flat
  keys — five of eight reply paths rendered raw i18n keys in the chat bubble
  (e.g. after tapping 直接生成), and `{name}` interpolation never ran. The
  resolver now flattens dotted keys to fragments and interpolates
  `contentParams`; verified against the real bundled runtime (8/8 localized).
- Supplier preset copy fix (`广州佰裳制衣厂`); `postTaskNotification` phrases
  the outcome by task state instead of always 已完成, and upserts the task
  conversation (Dart mirror included).
- Verification: `pnpm verify` green (12 spec validators, typecheck, all
  suites: common 52, H5, PC, mini-program 24, Flutter 52), H5/PC prod builds
  PASS, `flutter analyze` 0 issues, mini-program runtime rebuilt and
  re-probed. Rendered acceptance: see REQ-2026-0005 §Rendered Acceptance
  (2026-10-03, task confirmation round).

### 2026-10-03 — Rendered acceptance of the PRD-conformance round

- Browser acceptance against the rebuilt production bundles: H5 renders the
  agent-dispatch cards, the live task-state chip transition (through
  waiting_confirmation), localized message-center titles, and the four-column
  asset card. PC messages parity confirmed; the round exposed that the PC
  twin of the profile screen had not received the agents column — fixed and
  re-verified (对话/应用/Agent/联系人 four-column card).

### 2026-10-03 — PRD P0 conformance round: intent coverage, cross-surface feature parity

A PRD conformance sweep (against `docs/product/prd/PRD.md` and
REQ-2026-0001..0004) found functional deltas the route-contract audits could
not see. All of them are closed in this round:

- **AI router completes the PRD §10.1 intent set** (shared service family):
  `USE_AGENT` gains a recognition rule (ordered before `SEARCH_AGENT`'s
  bare-term branch); `SEARCH_AGENT`/`USE_AGENT` route to the agent roster
  (contact_results cards, keyword search with kind-filtered roster fallback),
  `CREATE_AGENT` recommends the roster (real agent creation stays a declared
  Phase-2 boundary), `USE_APP` routes to app result cards, and
  `EXECUTE_TASK`/`EDIT_CONTENT` start real tasks. New reply keys
  (`reply.searchAgent.*`, `reply.useAgent.*`, `reply.createAgent.*`,
  `reply.task.accepted`) shipped to all four surfaces (H5/PC nested,
  mini-program nested + dotted-path resolver, Flutter dotted mirror keys).
- **Task simulation walks the forward PRD §41 path**: pending → running →
  waiting_confirmation → completed (content/execute/edit tasks); terminal
  failure states remain type/UI-complete pending a real backend.
- **Messages**: `app`-kind conversation seeded (application notification), and
  the mini-program now resolves `titleKey` conversations to localized titles
  (a latent blank-title display defect).
- **Asset summary gains the Agent count** on all four surfaces (agent +
  assistant roster).
- **Mini-program**: the creation flow gains the post-create modify step
  (instruction → `modifyApp`), and the app center gains 热门应用 / 最近使用
  sections. Behavior suite 13 → 15 tests (23 total).
- **Flutter** (parity round): 我的应用 rebuilt (created/favorited tabs, open/
  publish/delete), creation modify step, detail favorite toggle, app center
  rebuilt (AI-create entry, 16 category chips, recents, hot), contacts search
  + 5-kind segments, chat task chip, profile Agent stat. Tests 33 → 45,
  `flutter analyze` 0 issues.
- Verification: `pnpm check` green, root typecheck 0 errors, all suites
  green (H5, PC, mini-program 23, Flutter 45, common 45+), H5/PC prod builds
  PASS, mini-program prod bundle builds.

### 2026-10-03 — Conformance audit (zero violations) + operational handoff docs

- **Adversarial spec audit** against the governing sdkwork-specs (route
  contract, five UI states, i18n layout and key parity, architecture
  boundaries, package layout, naming, test evidence, HTTP/int64 posture,
  manifests, documentation): ten checks, **zero MUST-level violations**; test
  counts and artifact claims re-verified against the tree. The single
  follow-up observation was closed in this round: PC now runs the same
  automated five-UI-state render suite as H5 (`tests/ui-states.test.tsx` +
  `tests/setup/test-runtime.ts`, 8 tests; PC suite 63 → 71).
- **Operational handoff docs**: `docs/runbooks/RUNBOOK-multi-surface-operations.md`
  (per-surface gates, artifact paths, smoke steps, recovery) and the
  developer/operator/integrator guides filled with the verified commands and
  the current mock-backed integration boundary.
- Verification: `pnpm verify` green end-to-end; root typecheck/test green;
  PC prod build PASS.

### 2026-10-03 — Mini-program page-behavior smoke + desktop release build

- **Mini-program**: new 13-test behavior suite (`tests/mini-program-page-behavior.test.mjs`)
  loads the real native page modules against the real bundled runtime inside a
  simulated WeChat host (`Page()`/`wx.*` stubs, CJS copy of `src/` under the OS
  temp dir) and drives every page's lifecycle and interactions: loads and
  states, search/empty, runner success + enterprise visitor denial, real
  favorite toggle, create→publish flow with validation, my-apps labels +
  confirmed delete, contact detail → direct conversation, thread send,
  contacts search filtering, profile summary + entries, task chip resolution,
  and locale switching. Surface suite is now 22 tests (9 contract + 13
  behavior); test script runs both files.
- **Desktop**: `pnpm build:desktop` verified end-to-end (PC standalone.production
  bundle + `cargo build --release` → self-contained `sdkwork-whatseek-pc-tauri.exe`).
- Verification: root check/typecheck/test green, H5 + PC prod builds PASS,
  mini-program prod build + 22/22, `flutter analyze` 0 issues + 33/33.

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
