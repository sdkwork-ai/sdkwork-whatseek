---
id: RUNBOOK-multi-surface-operations
title: Multi-surface operations — build, verify, and smoke every WhatSeek surface
owner: sdkwork-whatseek team
status: active
---

# RUNBOOK — Multi-Surface Operations

All commands run from the repository root unless a section says otherwise.
Every command below is the verified gate used by the delivery rounds recorded
in `docs/product/requirements/REQ-2026-0005-whatseek-multi-surface.md` and
`docs/changelogs/CHANGELOG.md`.

## 1. Repository gate (run this first, always)

```bash
pnpm verify   # = pnpm check (12 sdkwork-specs validators) + typecheck + test + build:h5:prod
```

`pnpm verify` exiting 0 is the pre-condition for any release conversation.

## 2. H5 (primary surface)

| Step | Command | Artifact |
| --- | --- | --- |
| Dev server | `pnpm dev` | Vite dev server (standalone profile) |
| Production build | `pnpm build:h5:prod` | `apps/sdkwork-whatseek-h5/dist/standalone/prod/` |

Notes:

- The bundle is an SPA with history routing — any static host must fall back
  unknown paths to `index.html`.
- Environment variants: `build:h5:dev|test|staging|prod` (canonical browser
  build runner, `FRONTEND_CODE_SPEC.md` §7).

## 3. PC browser + Windows desktop

| Step | Command | Artifact |
| --- | --- | --- |
| Production build | `pnpm build:pc:prod` | `apps/sdkwork-whatseek-pc/dist/standalone/prod/` |
| Desktop (self-contained) | `cd apps/sdkwork-whatseek-pc && pnpm build:desktop` | `apps/sdkwork-whatseek-pc/packages/sdkwork-whatseek-pc-tauri/src-tauri/target/release/sdkwork-whatseek-pc-tauri.exe` |

Notes:

- `build:desktop` rebuilds the PC web bundle first, then `cargo build
  --release`; the exe embeds the frontend (no external assets needed).
- The Rust toolchain is the windows-gnu host; the `.rsrc` manifest-merge
  linker warning during cargo builds is benign.

## 4. WeChat mini-program

```bash
cd apps/sdkwork-whatseek-mini-program
pnpm typecheck              # tsc over the surface + packages
pnpm test                   # 9 contract tests + 13 page-behavior smoke tests (node --test)
pnpm build                  # dev runtime bundle  -> src/runtime/app.js
pnpm build:mini-program:prod  # production runtime bundle
```

Notes:

- **The runtime bundle must exist before opening WeChat DevTools** — pages
  `require('../../runtime/app.js')`. If pages throw on load, run `pnpm build`
  first (a fresh clone has no bundle; `pnpm clean` removes it).
- DevTools smoke (manual, pre-store): import the project with
  `miniprogramRoot=src/` (see `project.config.json`), walk the five tabs and
  the eight detail-subpackage pages, and toggle WeChat's dark mode — the
  native `darkmode` + `theme.json` wiring follows the system setting.
- The behavior suite runs the real page modules against the real runtime
  bundle in Node; it does not render WXML. DevTools rendering remains the
  only visual check for this surface.

## 5. Flutter mobile

```bash
cd apps/sdkwork-whatseek-flutter-mobile
flutter analyze   # must report: No issues found!
flutter test      # 33 tests (route alignment, i18n layout, screens, chat router, settings)
```

Notes:

- `flutter pub get` uses the flutter-io.cn mirror (already configured);
  `--offline` works with the warmed pub cache.
- App-store packaging (APK/IPA) is a declared non-goal for the current
  milestone (`REQ-2026-0005` §Non-Goals).

## 6. Shared family changes ripple everywhere

`apps/sdkwork-whatseek-common` (route-core / intent-core / service-core) is
the only cross-surface seam. After touching it, re-run **every** surface gate
from this runbook — catalog data changes are consumed by all four renderings,
not just the TS surfaces.

## 7. Recovery

- Full clean: `pnpm clean` (removes bundles; run the surface builds again).
- Mini-program pages fail with "Cannot find module '../../runtime/app.js'":
  rebuild the bundle (`pnpm build` in the mini-program root).
- A red `pnpm check` validator: fix the named standard violation before any
  other work — the validators are the repo's definition of done.

## 9. Activating the sdkwork-im driver (messages + contacts go live)

The messages and contacts ports on every surface are gateway-ready: each
surface constructs one composed sdkwork-im client when its runtime config
declares an IM API base URL, and keeps the mock clients otherwise. To take a
surface live:

1. Mount the sdkwork-im gateway (`sdkwork-api-im-standalone-gateway` crate,
   PostgreSQL authority) behind the deployment topology.
2. Declare the base URL in the surface's runtime source, then rebuild:

| Surface | Source file | Key | Notes |
| --- | --- | --- | --- |
| H5 | `apps/sdkwork-whatseek-h5/etc/browser/runtime-env.<profile>.json` | `sdkworkImApiBaseUrl` (+ `sdkworkImWebSocketBaseUrl`) | same-origin `/im/v3/api` path or absolute URL |
| PC | `apps/sdkwork-whatseek-pc/etc/browser/runtime-env.<profile>.json` | `sdkworkImApiBaseUrl` (+ websocket key) | identical mechanism to H5 |
| Mini-program | `apps/sdkwork-whatseek-mini-program/config/mini-program/runtime-env.<profile>.json` | `sdkworkImApiBaseUrl` (+ websocket key) | absolute URL only (no same-origin concept); rebuild with `pnpm build` |
| Flutter | `apps/sdkwork-whatseek-flutter-mobile/env/sdkwork.<profile>.json` | `SDKWORK_IM_API_BASE_URL` (+ `SDKWORK_IM_WEB_SOCKET_BASE_URL`) | dart-define sources; rebuild the app |

3. Verify activation per surface: H5/PC `pnpm build:<arch>:dev` then the
   driver tests (`bootstrap-sdk-driver.test.ts`) plus a rendered pass —
   with a gateway mounted the messages/contacts lists come from IM
   conversations and the social address book; the mini-program bundle stamps
   the profile (`pnpm test` builds first); Flutter `flutter test` covers the
   adapter mapping.
4. Session tokens: the composed client shares one TokenManager per surface;
   tokens are fed by the IAM login runtime (APP_SDK_INTEGRATION_SPEC.md §4)
   once it lands. Until then every surface accepts an operator-declared
   bootstrap session through its runtime source —
   `sdkworkImBootstrapAccessToken` / `sdkworkImBootstrapAuthToken` on H5, PC,
   and the mini-program; `SDKWORK_IM_BOOTSTRAP_ACCESS_TOKEN` /
   `SDKWORK_IM_BOOTSTRAP_AUTH_TOKEN` dart-defines on Flutter. Mint a real
   dual-token session from the gateway's own IAM credential-entry surface
   (`POST /app/v3/api/auth/sessions`; registration consumes the dev fixed
   verification code, later logins use the password grant) and set both
   values in a LOCAL, uncommitted profile copy — committed profiles keep the
   keys empty and the secret-free architecture tests pin that.
5. Gateway bring-up (proven on a workstation, 2026-10-08): the canonical
   entrypoint is `pnpm gateway:run:standalone` in the sdkwork-im repo. The
   standalone gateway REQUIRES its PostgreSQL authority
   (`SDKWORK_DATABASE_*`, schema bootstraps itself on first boot) and pairs
   Redis for the realtime plane — put the Redis password inside
   `SDKWORK_IM_REDIS_URL` (`redis://:PASSWORD@host:6379/0`; no separate
   password variable is read). Readiness is observable: `/healthz` liveness
   plus `/readyz` composing database, Redis, agents runtime, worker, and
   realtime plane. With the gateway on `127.0.0.1:18089`, the full chain was
   verified live end to end (real IAM registration/login, friend request →
   contact, `bindDirectChat` conversation, SDK-posted and UI-posted messages,
   gateway read-back) — see REQ-2026-0005 "Live-Gateway Acceptance". Direct
   chats MUST go through `conversations.bindDirectChat` (actor pair); the
   app API rejects `memberUserIds` outside group conversations.

6. Troubleshooting — stale gateway-configured build artifacts (proven
   2026-10-08): a dist built while a live-gateway runtime source was in
   place keeps serving that gateway URL (and bootstrap tokens) after the
   gateway process stops — messages/contacts then fall to the error state
   with a retry loop that never recovers, while chat/apps (mock drivers)
   keep working. Diagnose by reading the built
   `dist/**/runtime-env.json` (or the mini-program bundle's stamped
   profile): a non-empty `sdkworkImApiBaseUrl` with no listener on that
   address is this failure. Recovery is a rebuild from the committed
   (empty-key) sources — `pnpm build:h5:prod` / `pnpm build:pc:prod`,
   mini-program `pnpm build`, Flutter rebuild — and re-verify the two
   lists render. Keep live-gateway profiles in LOCAL, uncommitted runtime
   sources (step 4) so committed rebuilds always reset to the mock
   driver.

## 8. Escalation

Verification evidence and acceptance criteria live in
`docs/product/requirements/REQ-2026-0005-whatseek-multi-surface.md`; change
history in `docs/changelogs/CHANGELOG.md`.
