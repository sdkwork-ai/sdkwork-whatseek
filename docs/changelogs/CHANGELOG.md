# Changelog

All notable changes to the WhatSeek application repository. Format follows
`DOCUMENTATION_SPEC.md` §9; release entries additionally follow `RELEASE_SPEC.md`.

## Unreleased

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
