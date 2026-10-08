# Changelog

All notable changes to the WhatSeek application repository. Format follows
`DOCUMENTATION_SPEC.md` §9; release entries additionally follow `RELEASE_SPEC.md`.

## Unreleased

### 2026-10-09 — Developer-apps rail integrates `listings/{id}/developer_other` on every detail screen

- **`AppsPort.listDeveloperApps`**: store drivers resolve the developer-other
  endpoint (top 6 listing summaries); the mock driver returns an empty list
  and the UI hides the rail. The `createAppsClient` gateway assembly gains
  the `listDeveloperOther` slice; the Dart adapter mirrors it.
- **Four detail screens render the rail**: H5/PC append a 开发者的其他应用
  Card of ListRows below the similar rail; Flutter renders ListTile rows
  after the similar FutureBuilder; the mini-program detail page loads it in
  parallel with the detail fetch and taps re-run `load()`.
- **i18n**: one new key per surface apps fragment (`detail.developerApps` =
  开发者的其他应用 / More from this developer), including the Flutter zh/en
  JSON + Dart flat map.
- **Tests**: service-core and Dart adapter suites pin endpoint resolution
  (limit 6, listing order); chat capability port stubs updated.

### 2026-10-09 — Active store events fold into the collections pipeline (adapter-level, zero UI change)

- **Events are curated collections in the appstore domain** (`collectionType`
  includes EVENT), so the integration folds them into the existing
  collections pipeline instead of adding a new section: `listHomeFeed`
  fetches ACTIVE events (`catalog/events`, status `active`, top 4) and maps
  each onto a kind-event `AppCollectionCard` appended after the home
  payload's collections (their listing ids join the one batched resolution);
  `getCollection` falls back to `catalog/events/{id}` when the collections
  endpoint misses, so tapping an event card opens the existing collection
  detail route through the same `listCollectionApps` path. Port, model, and
  all four surfaces' UI are unchanged — the folding lives entirely inside
  the shared TS adapter and the Dart adapter (best-effort: an events fetch
  failure leaves the feed untouched).
- **Tests**: service-core pins the folded event card (title/kind/cover apps,
  status `active`, limit 4) and the collections→events fallback (including
  `listCollectionApps` routing); the Dart adapter suite gains the same two
  cases with envelope-shaped fakes (`event-*` fixture ids miss the
  collections endpoint).

### 2026-10-09 — Search history integrates the appstore `search.history` endpoints

- **`AppsPort.listSearchHistory` / `recordSearchHistory` / `clearSearchHistory`**:
  store drivers serve them from `catalog/search/history` (list top 10,
  rows read `queryText` first with the term/keyword fallback), upsert
  `{queryText}` on submit, and DELETE on clear; the mock driver persists to
  localStorage like the other whatseek-local scope (the Dart mock keeps an
  in-memory session list).
- **Four search screens**: H5/PC render a 搜索历史 chip row (with 清除 button
  that clears and refetches via a version-keyed reload) above trending, and
  record each submitted query fire-and-forget; Flutter adds the same chips +
  clear TextButton with a `_loadHistory` refresh helper; the mini-program
  search page records on search and binds the history row + clear in WXML
  (runtime `apps.history/recordHistory/clearHistory` bindings).
- **i18n**: two new keys per surface apps fragment (`search.history` =
  搜索历史 / Recent searches, `search.historyClear` = 清除 / Clear),
  including the Flutter zh/en JSON + Dart flat map.
- **Tests**: service-core pins row reading (queryText-first fallback, empty
  dropped), upsert body, and the empty-query guard; the Dart adapter suite
  gains the same case.

### 2026-10-09 — Reviews section integrates `listings/{id}/ratings` on every detail screen

- **`AppReview` model + `AppsPort.listAppReviews`**: store drivers map the
  appstore rating rows (`{id, userId, rating, title?, createdAt}`) for the
  detail screen 评论 section (top 10); the mock driver returns an empty list
  and the UI hides the section. The `createAppsClient` gateway assembly gains
  the `listRatings` slice; the Dart adapter mirrors it (`ListingRating`
  envelope navigation) with a new `AppReview` Dart model.
- **Four detail screens render the reviews**: H5/PC append a 用户评论 Card
  (star · author · date, optional headline); Flutter mirrors with the same
  rows; the mini-program detail page loads reviews in parallel with the
  detail fetch (runtime `apps.reviews` binding) and renders the WXML block
  with page styles.
- **i18n**: one new key per surface apps fragment (`detail.reviews` =
  用户评论 / Reviews), including the Flutter zh/en JSON + Dart flat map.
- **Tests**: service-core and Dart adapter suites pin rating-row mapping
  (author/rating/title fallbacks).

### 2026-10-09 — Similar-apps rail integrates `listings/{id}/similar` on every detail screen

- **`AppsPort.listSimilarApps`**: store drivers resolve the appstore similar
  endpoint (top 6 listing summaries); the mock driver returns an empty list
  and the UI hides the rail. The `createAppsClient` gateway assembly gains
  the `listSimilar` slice from the one composed client; the Dart adapter
  mirrors it over the generated family (envelope row navigation).
- **Four detail screens render the rail**: H5/PC append a 相似应用 Card of
  ListRows (icon, name, rating·price) below the detail card, tapping
  navigating to that app's detail; Flutter renders ListTile rows with the
  same navigation; the mini-program detail page loads the list in parallel
  with the detail fetch and re-runs `load()` on tap.
- **i18n**: one new key per surface apps fragment (`detail.similar` =
  相似应用 / Similar apps), including the Flutter zh/en JSON + Dart flat map.
- **Tests**: service-core and Dart adapter suites pin endpoint resolution
  (limit 6, listing-id order).

### 2026-10-09 — Search discovery integrates the appstore suggestions + trending endpoints on all four surfaces

- **`AppsPort.listTrendingSearches` / `listSearchSuggestions`**: store drivers
  serve them from `catalog/search/trending` (zh-CN first, top 10) and
  `catalog/search/suggestions` (per typed prefix, deduped against the raw
  query, empty-row filtered — the sdkwork-appstore reference search page's
  `term/keyword/suggestion` row reading). The mock driver seeds trending from
  the local catalog names and filters catalog names for suggestions, so the
  standalone demo shows the feature with local data.
- **Four search screens consume the discovery components**: H5/PC
  `AppSearchScreen` render 热门搜索 chips on the empty-query state and a
  debounced (250ms, ≥2 chars) suggestion list under the input that submits on
  tap; the Flutter search screen gains a controlled text field with the same
  debounce plus ActionChip trending (mock fallback hides both when lists are
  empty); the mini-program search page adds timer-based suggestion debounce
  and trending chips with WXML bindings and page styles.
- **i18n**: one new key per surface apps fragment (`search.trending` =
  热门搜索 / Trending searches) — H5/PC/mp JSON fragments and the Flutter
  zh/en JSON + Dart flat map (parity-tested).
- **Tests**: service-core adapter pins term-row reading (`term`/`keyword`
  fallback, dedupe, empty-row drop); the Dart adapter suite gains the same
  case; chat-capability port stubs updated for the two new port methods.

### 2026-10-09 — One session TokenManager shared by every SDK driver (§4 conformance)

- **§4 closure fix**: APP_SDK_INTEGRATION_SPEC.md §4 mandates exactly one
  global TokenManager per authenticated session context, shared by every SDK
  client — but the IM and appstore driver factories each constructed their
  own, which could also diverge the two drivers' session credentials. Both
  factories now share one module-scoped session manager
  (`sdk/driverClients`), created lazily on first driver activation; whichever
  operator bridge seeds first feeds every driver, and a driver-factory test
  pins the instance identity across drivers. The high-level IAM auth runtime
  factories remain unavailable for these architectures (no appbase wrapper
  exists yet), so the operator bootstrap bridge stays the documented §4
  interim.

### 2026-10-09 — App detail integrates the appstore listing detail + media across all four surfaces

- **`AppsPort.getAppDetail` closes the Phase-1 screenshot placeholder**: store
  drivers hydrate the detail screen from `listings/{id}` (whatsNew, current
  version, and the full description when longer than the search-preview
  summary) plus `listings/{id}/media` (SCREENSHOT-role entries with
  renderable URLs, sorted by sortOrder, capped at six — mirroring the
  sdkwork-appstore reference detail page, which renders only media carrying
  URLs). Created apps and the mock driver keep the summary shape, so the
  placeholder strip remains the honest fallback. Port addition only — the
  existing `getApp` stays for tiles/cards/runner.
- **Four detail screens consume the enrichment**: H5/PC `AppDetailScreen`
  render screenshot images with the placeholder strip as mock-driver
  fallback, a keyless `v{version}` chip in the meta row, and the whatsNew
  paragraph under the summary; the Flutter detail screen mirrors the same
  (network images with error fallback); the mini-program detail page binds
  `app.screenshots` / `app.currentVersion` / `app.whatsNew` in WXML with the
  runtime `apps.detail` binding switched to `getAppDetail`.
- **Tests**: service-core adapter tests pin detail hydration (role filter,
  sort order, description upgrade, local fallback for created apps); the Dart
  adapter suite gains the same two cases with envelope-shaped fakes.

### 2026-10-09 — Shared driver factories own composed-client construction; 收藏 rides the appstore wishlist

- **Driver factories move to the common family**: `createImSdkClient` /
  `createAppstoreSdkClient` / `createMessagesClient` / `createContactsClient` /
  `createAppsClient` are now owned once by
  `@sdkwork/whatseek-service-core` (`sdk/driverClients`), taking a structural
  driver-env (the seven `sdkwork{Im,Appstore}*` source keys) plus the surface
  identity. The H5 and PC bootstrap composition roots — previously line-for-line
  duplicates — shrink to thin wrappers that pin `platform: 'h5'|'pc'` and the
  session-principal accessor; the mini-program runtime likewise stops
  hand-wiring TokenManagers and passes its `wx.connectSocket` transport factory.
  Bootstraps remain the only places that invoke construction and register ports
  (APP_SDK_INTEGRATION_SPEC.md §1); H5's root manifest declares
  `@sdkwork/whatseek-service-core` directly now that its bootstrap composes
  over it.
- **收藏 integrates the appstore wishlist (Phase-3 seam closed early)**: store
  listings toggle the server-side wishlist (`wishlist.items` add/remove/list,
  client idempotency key on add) and favorites merge wishlist-resolved cards
  with whatseek-local ones; AI-created `gen-*` apps never resolve as store
  listings and keep the local favorites scope. Port shape unchanged — the
  split lives entirely inside the shared TS adapter and the Dart adapter
  (`createAppsClient` assembles the gateway from the catalog + wishlist
  slices). Mock-driver standalone profiles see zero behavior change.
- **Tests**: service-core gains the driver-factory suite (platform stamping,
  null cases, token-bridge seeding, gateway assembly) and wishlist favorites
  coverage (stateful fake, toggle both ways, local fallback); the Dart adapter
  test pins the same favorites split.

### 2026-10-08 — SDK adapter boundaries consolidate into the common family; appstore driver reaches every surface

- **SDK adapters move to `@sdkwork-whatseek-service-core` (高内聚低耦合)**:
  the IM messages/contacts adapters and the appstore apps adapter are now
  owned once by the shared common family — the seam
  APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md assigns to it ("owns contracts,
  service ports, runtime, bootstrap, SDK adapter boundaries"). The eight
  per-surface copies (h5/pc/mp × messages/contacts, h5/pc apps) become thin
  re-exports with unchanged public capability boundaries, six duplicated
  adapter test suites collapse into the service-core suite (47 tests), and the
  capability packages drop their now-unused `@sdkwork/im-sdk` /
  `@sdkwork/appstore-app-sdk` workspace deps — `sdkClients` declarations move
  to the service-core spec alongside `sdkDependencies`.
- **Mini-program mounts the sdkwork-appstore driver**: `sdkworkAppstoreApiBaseUrl`
  (+ `…Bootstrap{AccessToken,AuthToken}` operator bridge) joins
  `MiniProgramRuntimeConfig`, the four committed `config/mini-program` profiles
  declare the keys empty (the surface-contract pin test now covers the full SDK
  driver key set), `bootstrapMiniProgramClients` gains an `apps` override, and
  the runtime composition root constructs one composed appstore client — the
  native 应用 tab then serves the same appstore home feed as H5/PC.
- **Flutter mounts the sdkwork-appstore driver**: the generated Dart family
  `sdkwork_appstore_app_sdk` is pinned via pubspec path override; core gains
  the `AppsClient` port interface (the Dart mirror of TS `AppsPort`,
  `MockAppsClient implements AppsClient`, chat recomposes over it), the apps
  capability package owns the Dart `AppstoreAppsClient` adapter (envelope-safe
  `data['item']`/`data['items']` navigation, same feed assembly and chart-code
  mapping as TS), `bindPorts` swaps the apps driver, and the
  `SDKWORK_APPSTORE_API_BASE_URL` dart-define keys land empty across the four
  committed env profiles. 4 adapter tests pin feed assembly, chart mapping,
  local-scope fallback, and envelope navigation.
- **Mini-program lib bump**: the mp tsconfig `lib` moves to ES2022 (target
  stays ES2021, noEmit) — the workspace-linked sdkwork-appstore source graph
  (through `@sdkwork/utils`) requires it; runtime bundles are unchanged
  (esbuild), and the appstore code path only executes when an operator profile
  opts into the gateway.

### 2026-10-08 — App center home integrates the sdkwork-appstore catalog (Phase-2 platform wiring)

- **The 应用 tab home no longer re-implements the appstore home feed**: the
  apps capability gains a second `AppsPort` driver, `createAppstoreAppsClient`,
  over the composed `@sdkwork/appstore-app-sdk` consumer package
  (`/app/v3/api`; sdkwork-appstore PRD §4.2.1 首页编辑流). Heroes resolve from
  `catalog.home` featured slots, curated collections from `catalog.collections`
  (localized, cover apps batch-resolved through one listing search), 榜单速览
  from chart snapshots (`top`→热门, `free`→免费, `new`→新品), search from
  `catalog.listings.search`, recommendations/categories likewise — the same
  consume-through-SDK rule the sdkwork-appstore surfaces follow. Whatseek-local
  user scope (最近使用, 收藏, 我的应用, AI 创建 lifecycle) stays on the mock
  client until the appstore user-library family lands.
- **Same integration pattern as the sdkwork-im driver**: composed client
  constructed exactly once at each bootstrap (`createAppstoreSdkClient`, one
  session TokenManager, `sdkworkAppstoreBootstrap{AccessToken,AuthToken}`
  operator bridge), activated per surface by the `sdkworkAppstoreApiBaseUrl`
  runtime-env source key (declared empty across all eight committed H5/PC
  profiles, so standalone profiles keep the mock home feed). Spec declarations
  follow suit: `sdkDependencies` gains
  `sdkwork-appstore-app-sdk/app-api/authenticated-app-api` at each surface
  core, `sdkClients` gains `@sdkwork/appstore-app-sdk` at each apps package.
- **Upstream SDK strictness fix**: the appstore composed facade
  (`composed/client.ts`) now passes `exactOptionalPropertyTypes` consumers —
  undefined query params are stripped (`omitUndefined`) instead of assigned,
  behavior unchanged. Adapter + bootstrap driver tests pin feed assembly
  (single batched listing resolution), chart-code mapping, local-scope
  delegation, and token-bridge seeding on both H5 and PC.

### 2026-10-08 — Live-gateway acceptance: real IM end to end + operator token bridge

- **Mini-program plan artifacts now render (PRD §3 blocker)**: the create
  plan step and the chat `app_plan` card carried `pages`/`dataModel` in data
  but never rendered them — both WXML views now bind the 页面规划/数据模型
  规划 sections (zh/en fragment keys added), with a WXML-binding pin test so
  the artifacts cannot regress to title+modules-only, and a runtime-config
  contract test pinning the full sdkwork-im driver key set empty across all
  four committed profiles. Mini-program suite 34 → 36.
- **Share-text drift closed**: the mini-program 我的应用 share copies
  `${name} · WhatSeek` (was `· WhatSeek 问寻`), matching H5/PC/Flutter; the
  hardcoded zh modify/share strings move into the localized `my` fragment
  (`modifyPlaceholder`/`modifyApply`/toasts/`shared`).
- **Direct conversations bind by actor pair**: the gateway rejects
  `memberUserIds` outside group conversations, so the surfaces'
  `openDirectConversation` switches from `conversations.create` to
  `conversations.bindDirectChat` (H5/PC/mini-program TS slices + Flutter
  Dart gateway), with adapter tests pinning the actor-pair body.
- **Direct-row title fallback**: real inbox entries carry no
  conversation-level display name, which rendered the misleading
  system-notice fallback — all four adapters fall back to the peer's display
  name, then the peer principal id.
- **Operator bootstrap-token bridge (IAM Phase-2 seam)**: every surface's
  runtime source declares `sdkworkImBootstrapAccessToken`/`…AuthToken`
  (empty in committed profiles; secret-free architecture tests now check at
  the value level and pin credential-bearing keys empty). Tokens mint from
  the gateway's own IAM credential-entry surface; the seam mechanism is
  exactly the TokenManager the Phase-2 login runtime will feed.
- **Live acceptance (REQ-2026-0005 "Live-Gateway Acceptance")**: the
  sdkwork-im standalone gateway was brought up locally (PostgreSQL
  authority + Redis realtime plane, `/readyz` ready); real IAM registration
  (dev fixed code) + password login, friend request → contact,
  `bindDirectChat` conversation, SDK-posted messages, and a browser session
  on the built H5 dist rendering the real inbox (real unread badge, real
  thread) and sending a message from the UI composer that read back from
  the gateway through the peer's session. Runbook §9 rewritten with the
  proven bring-up recipe (Redis password lives inside `SDKWORK_IM_REDIS_URL`)
  and the token bridge.
- **Certificate re-measured**: 382 executed assertions green (vitest 270 +
  mini-program 36 + Flutter 76), 13 standard checks; the earlier "H5 38 /
  PC 36 / ~220 / 12 checks" snapshot undercounted and is corrected in
  REQ-2026-0005.
- Verification: `pnpm check` + `pnpm typecheck` + workspace tests EXIT=0;
  mini-program typecheck/build/test 36/36; Flutter analyze clean + 54 root
  + 9 messages + 13 apps; H5/PC prod builds EXIT=0.

### 2026-10-08 — Regression + adversarial audit round; stale gateway-artifact incident operationalized

- **Full-matrix regression** on the recorded baseline and the current
  tree: `pnpm verify` EXIT=0 (H5 117 / PC 99 / common 52 vitest,
  mini-program 34 tests, H5 prod build), PC prod + H5 dev/test/staging +
  mini-program staging/prod builds, Tauri `cargo build --release` +
  launch smoke. Flutter 54+26 green on the baseline tree; the current
  tree is red mid-flight from the in-progress sdkwork-appstore
  Dart-family landing (missing per-package `pubspec_overrides` wiring —
  owned by the appstore integration round).
- **Adversarial audit: 0 new P0/P1/P2.** PRD §1-§9 line-by-line, a
  placeholder/dead-code scan (90 flagged files, all benign i18n input
  hints or build tooling), a hardcoded-CJK-outside-i18n scan (four
  surfaces clean; mock session display names and the `万` count suffix
  recorded as deliberate Phase-1 boundaries), and spec MUST spot checks.
  Fixed the duplicated 2026-10-03 CHANGELOG heading.
- **Incident (diagnosed, recovered, operationalized)**: messages/contacts
  fell to a never-recovering error state on both web surfaces while
  chat/apps stayed healthy. Root cause was a stale H5 dist built during
  the live-gateway acceptance — it kept serving
  `sdkworkImApiBaseUrl: 127.0.0.1:18089` + operator bootstrap tokens
  after the gateway stopped; the five-state error handling behaved
  exactly as designed. Recovery is a rebuild from the committed
  empty-key sources; documented as runbook §9 step 6 (troubleshooting)
  with the `dist/**/runtime-env.json` diagnosis step.
- **Rendered acceptance on the fresh builds** (CUA/deep-link driven —
  Playwright locator clicks hang on this React tree, documented since
  2026-10-03): H5 390×844 five tabs + direct deep links (messages 7
  conversations + badge 4, contacts 11 + six segments, apps center full
  编辑流, profile visitor + five assets); PC 1440×900 nav rail + chat
  task chips + messages/contacts/apps. Zero regressions. Evidence:
  REQ-2026-0005 "Regression and Acceptance Round (2026-10-08)".

### 2026-10-07 — Parity polish: Flutter 收藏 deep link + mini-program plan types

- **Flutter 收藏 quick link** now opens 我的应用 on the favorites segment
  (`MyAppsScreen.openOnFavorites` + route argument), closing the last
  recorded cross-surface deviation (H5 `/apps/my?tab=favorites` parity).
- **Mini-program plan types**: the stale `{ title, modules }` declarations on
  the `draftCreationPlan` wrapper and the runtime `draftPlan` facade are
  corrected to the full `{ modules, pages, dataModel }` contract shape (the
  runtime value was already correct; the types now tell the truth).
- **IM gateway bring-up feasibility (final)**: the standalone gateway is a
  62-crate Rust workspace requiring PostgreSQL; this environment has no
  Docker — activation stays documented in runbook §9 for the deployment
  machine.
- Verification: `pnpm verify` green; mini-program 34 tests; Flutter analyze
  clean + 67 tests.

### 2026-10-07 — Regression hardening: mini-program scenario coverage + desktop exe re-verified

- **Mini-program page-behavior suite 31 → 34**: three scenarios pin the new
  capabilities — the creation plan step surfaces 页面规划/数据模型规划
  artifacts end-to-end through the runtime facade; 我的应用 AI 修改 drives
  the editable modal, bumps the patch version, and share copies the app card
  through the clipboard host; the contacts six-segment filter (kind filter,
  restore, combined query+kind).
- **Desktop shell re-verified end-to-end**: `build:prod` + `cargo build
  --release` produce the self-contained `sdkwork-whatseek-pc-tauri.exe`
  (5.2 MB), launched and terminated cleanly against the production dist.
- Verification: `pnpm verify` green; Flutter analyze clean + 54 tests.

### 2026-10-07 — Conformance backlog emptied: plan artifacts + 我的应用 edit/share

- **Generation plan artifacts (PRD §3)**: `draftCreationPlan` returns
  `{ modules, pages, dataModel }` (keyword-matched 页面规划/数据模型规划 in
  the shared catalog + the Dart mock mirror); the creation-flow plan step and
  the chat `app_plan` card render all three artifact groups on every surface.
- **我的应用 edit/share (PRD §21/REQ-0003)**: "AI 修改" from 我的应用 on all
  four surfaces (H5/PC inline instruction row, MP editable modal, Flutter
  dialog) driving the port's version-bumping `modifyApp`; share completes on
  MP (`wx.setClipboardData`) and Flutter (core `WhatseekHost.clipboard` port
  locator) matching the H5/PC copy semantics.
- REQ-2026-0005 conformance record: **0 P0 / 0 P1 / 0 P2 open** — the PRD
  re-scan backlog is fully closed; the recommendation 功能差异/自定义 fields
  remain tracked with the app-api data-model milestone.
- Verification: `pnpm verify` green; mp 31 tests; Flutter analyze clean +
  67 tests; H5 38 + PC 36 tests; standards gates + `pnpm check` green.

### 2026-10-07 — Final PRD P1 closes; five P2 conformance gaps shut

- **Mini-program chrome i18n (last P1)**: every page's static strings are
  locale-aware through per-capability `strings()` accessors wired into the
  settings locale switch; zh chrome byte-identical, en mirrors H5. Native
  tabBar labels stay the documented platform boundary.
- **Profile fifth asset (消息)** joins 对话/应用/Agent/联系人 on all four
  surfaces (REQ-0004).
- **Search rows** gain the full REQ-0002 coverage line (category · rating ·
  users · price · AI) on every surface; **app details** gain category +
  screenshots placeholder everywhere and close the Flutter/MP-specific gaps
  (rating/updated/permissions; users/updated/permissions/AI badge).
- **Chat recommendation cards** carry the AI capability marker on all four
  surfaces; **mini-program contacts** gains the six-segment kind filter.
- REQ-2026-0005 backlog shrinks to two P2s (我的应用 edit/share entry;
  generation plan page/data-model artifacts).
- Verification: `pnpm verify` green; mp 31 tests; Flutter analyze clean +
  54 root + 13 apps tests; standards gates + `pnpm check` green.

### 2026-10-07 — Appstore home feed lands on PC, mini-program, and Flutter (PRD §4/§5.1)

The 编辑流 home feed (hero carousel → 今日精选 → 编辑精选 → 为你推荐 →
榜单速览 → categories → recents) is no longer H5-only:

- **PC**: six feed components (desktop-tailored grids), AppChartsScreen +
  AppCollectionScreen, routes `app.whatseek.apps.charts` /
  `app.whatseek.apps.collection` (route table 13→15 matching H5), i18n keys
  byte-aligned with the H5 fragments. 36 tests green.
- **Mini-program**: the runtime facade already exposed
  `listHomeFeed`/`getCollection`/`listChart` with no consumer — the apps page
  now renders the feed sections and two new detail pages
  (`apps-charts`/`apps-collection`) consume them through the facade; page
  list registered in `app.json`. 31 tests green.
- **Flutter**: the Dart mock client ports the shared homeFeed module
  (editorial seeds + 19-app shared catalog), charts/collection screens, route
  table 13→15 (route-table change flagged for human review per the Flutter
  AGENTS rule), i18n mirror parity maintained. analyze clean + 67 tests.
- Verification: `pnpm verify` green; all six SDK/architecture standards gates
  pass; `pnpm check` green.

### 2026-10-07 — PRD re-scan: task deep link on four surfaces, mini-program favorites + i18n drift fixes

- **Task-notification → chat deep link (PRD §5.5, all four surfaces)**: task
  conversations show a "view task result" affordance in the conversation
  view; following it opens the chat tab and restores the task as an entry
  with its live state chip (H5/PC `?taskId=` param consumed once by
  ChatHomeScreen, mini-program globalData hand-off through `switchTab`,
  Flutter `pendingTaskLink`/`tabRequest` ValueNotifiers on the runtime).
- **Mini-program favorites** (REQ-0003): 我的应用 gains the created/favorites
  dual tab with cancel-favorite actions and empty states, plus the missing
  version label — matching H5/PC/Flutter.
- **Mini-program i18n drift**: contact-kind labels (segment keys aligned with
  H5) and task-chip labels (all seven PRD §41 states, `whatseek.chat.task.*`
  aligned) are fragment-driven and locale-aware; the contact-detail page
  drops its own drifted label map; `setContactsLocale` joins the settings
  switch; the unused hardcoded commons task map is removed.
- Conformance record: REQ-2026-0005 carries the full PRD re-scan result
  (0 P0 / 4→2 P1 / 7 P2) with the ordered open backlog.
- Verification: `pnpm verify` green; mini-program 31 tests + three profile
  builds; Flutter analyze clean + 63 tests; PC prod build + Tauri
  `cargo check` green; `flutter build apk --debug` preflight blocked by the
  missing Android SDK (environment boundary, release milestone).

### 2026-10-07 — sdkwork-im family lands on PC, mini-program, and Flutter

- **PC** (`apps/sdkwork-whatseek-pc`): the bootstrap composition root
  (`src/bootstrap/sdkClients.ts`) constructs one composed `@sdkwork/im-sdk`
  client (platform `pc`, one session TokenManager) when
  `sdkworkImApiBaseUrl` is declared in `etc/browser/runtime-env.*.json`, and
  injects it into `createImMessagesClient` / `createImContactsClient`
  adapters in the messages and contacts capability packages — the same
  narrow-gateway-slice pattern as H5. Component specs declare the family
  (`sdkDependencies` at core, `sdkClients` at the feature packages); new
  bootstrap driver test + 14 mirrored adapter tests.
- **Mini-program** (`apps/sdkwork-whatseek-mini-program`): the WeChat runtime
  has no fetch/WebSocket, so `sdkwork-whatseek-mp-core` grows typed
  transport ports (`transport/miniProgramTransports.ts`): a `wx.request`
  -backed fetch polyfill (Response surface + AbortController shim) and a
  `wx.connectSocket`-backed realtime factory mapped onto the SDK's
  addEventListener surface. Only `src/bootstrap/runtime.ts` touches `wx.*`;
  the composed client activates from the runtime-env
  `sdkworkImApiBaseUrl` key. The runtime bundle (`src/runtime/app.js`) is
  now a git-ignored build product — `pnpm test` builds before testing —
  keeping the consumer-import gate scanning authored source only. 31 tests
  green (6 new transport-adapter tests).
- **Flutter** (`apps/sdkwork-whatseek-flutter-mobile`): consumes the
  generated Dart family through the composed `im_sdk_composed` facade
  (sibling path pins in the app-root `dependency_overrides` plus capability
  `pubspec_overrides.yaml`). Core grows `ContactsClient`/`MessagesClient`
  port interfaces (`src/ports.dart`) implemented by both the mock clients
  and the new IM adapters; `WhatseekRuntime.bindPorts` swaps drivers and
  recomposes chat; env keys `SDKWORK_IM_API_BASE_URL` /
  `SDKWORK_IM_WEB_SOCKET_BASE_URL` join all four dart-define profiles.
  `flutter analyze` clean; 67 tests green (54 root + 13 adapter).
- **Governance**: AGENTS.md SDK routing sections refreshed on all surfaces;
  the copied HTTP-envelope normative bodies are replaced with router
  references (agent/workflow standard green); the packaging workflow exposes
  the four sibling dependency ref inputs with `dependency_refs_json`;
  `im_sdk_composed` now re-exports the generated family (sdkwork-im
  c15dde80).
- Verification: `pnpm verify` green (check + typecheck + tests + H5 prod
  build); `pnpm build:pc:dev` PASS; mini-program dev/staging/prod builds +
  31 tests green; Flutter analyze + tests green; `check-sdk-standard`,
  `check-app-sdk-consumer-imports`, `check-frontend-composition`,
  `check-component-port-bindings`, API envelope + operation pattern checks,
  `pnpm check` all pass; rendered visual regression of H5 (390×844:
  chat/messages/contacts/profile) and PC (1440×900:
  chat/messages/contacts) shows zero UI change (mock driver standalone
  default). IAM login runtime remains the documented Phase-2 boundary
  (credential seam ready, no gateway mounted in standalone profiles).

### 2026-10-03 — Shared mobile navbar lands in sdkwork-appbase; app shells reuse it

- **`@sdkwork/shell-mobile-react` gains `SdkworkMobileNavBar`** (subpath
  `@sdkwork/shell-mobile-react/navbar`): the shared page navbar — back
  control, title, right action slot, safe-area sticky header with theme
  override vars (`--sdkwork-app-navbar-*`), zero app/router dependencies
  (data in, events out; default back = `history.back()`).
- **WhatSeek H5**: eight screens hand-rolled their own back-title headers
  (app detail/runner/create, settings, contact detail, conversation); all
  refactored to compose the shared navbar (the app-search top bar stays a
  search control, not a navbar). Consumed through a `link:` dependency on
  the appbase package with a `./navbar` subpath export that keeps the
  consumer compile closure to the component only.
- **sdkwork-mall H5**: `SdkworkMallH5NavBar` now composes the shared navbar
  internally (its call sites unchanged); the local header markup and the
  unused ChevronLeft import are gone.
- **Spec**: `APP_MOBILE_REACT_UI_SPEC` §3 codifies the ownership rule —
  shared shell chrome (navbar, tab bar) is defined once in the appbase shell
  foundation package and reused; app capability packages must not hand-roll
  headers; shared chrome stays app-agnostic.
- Verification: whatseek `pnpm typecheck` 0 errors, H5 root suite 33 tests,
  mall typecheck + build + 146 tests green; appbase navbar unit tests added
  (title/back/right/className) to run under the appbase vitest workspace.

### 2026-10-03 — Tab-bar icon states: filled selected / outline unselected, codified in sdkwork-specs

- **Norm first**: `APP_MOBILE_REACT_UI_SPEC` §5, `APP_MINI_PROGRAM_UI_SPEC` §7,
  and `APP_FLUTTER_UI_SPEC` §5 gain a `MUST`-level rule — the selected tab
  renders a filled icon, unselected tabs render the outline glyph of the same
  icon, selection is never conveyed by color alone; platform native
  selected-icon slots (`selectedIconPath`, `NavigationDestination(selectedIcon:)`)
  `MUST` be used where they exist.
- **H5**: the tab bar computes the active tab (`aria-current="page"`) and
  fills the glyph (`fill="currentColor"`) for it, outline for the rest —
  selection now readable without color. Pinned by a render test
  (`marks_the_selected_tab_with_a_filled_icon_and_unselected_with_outline`).
- **PC**: the desktop nav rail mirrors the same filled/outline treatment
  (test twin).
- **Flutter**: `WhatseekShell` destinations carry `(label, icon, selectedIcon)`
  and render through `NavigationDestination(icon:/selectedIcon:)` with
  Material outline/filled pairs per tab (auto_awesome, grid_view, people,
  chat_bubble, person).
- **Mini-program**: the native tabBar gains real icons — a generator script
  (`scripts/gen-tabbar-icons.mjs`, pure Node rasterizer) emits five
  outline/filled 81×81 PNG pairs (`src/assets/tabbar/`), wired through
  `iconPath`/`selectedIconPath`; the surface-contract test pins every tab to
  the pair and asserts the assets exist.
- Vitest note: the H5 config inlines `@sdkwork/whatseek-h5-shell`
  (`server.deps.inline`) — externalized source-linked workspace packages
  pre-bundle through esbuild, which rewrites their internal
  `@sdkwork/whatseek-h5-*` imports into unresolvable optimized ids.
- Verification: `pnpm verify` EXIT=0, H5/PC prod builds PASS, mp 25 tests,
  Flutter 54 tests + analyze clean; rendered screenshots confirm filled
  active glyphs on the H5 tab bar.

### 2026-10-03 — Acceptance sweep of the tech-blue round: localized app-kind chips, desktop + dark-mode verification

- Rendered sweep of the full-bleed restyle on PC 1440×900 (应用/消息/我的 —
  the shared full-bleed Card sits correctly inside the desktop content
  column) and H5 dark mode (消息/我的应用/应用详情/会话 — hairlines and brand
  tokens hold; the muted send button is the disabled state, not a token
  regression).
- Fix found by the sweep: the app-detail tag row rendered the raw
  `app.kind` enum (`ai`/`enterprise`) as a chip on H5/PC — now localized
  through new `whatseek.apps.kind.*` keys (eight kinds, zh + en). No other
  raw-enum renderings exist (audited H5/PC/mp/Flutter).
- Desktop regression: `cargo build` green after the theme/Card changes;
  REQ-2026-0005 acceptance counts refreshed (mp 25, Flutter 54).
- Verification: `pnpm verify` EXIT=0, H5/PC prod builds PASS; rendered
  probe confirms the detail chip now reads 企业应用.

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
