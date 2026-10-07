# etc/ — Source Configuration (apps/sdkwork-whatseek-h5)

Source configuration for the WhatSeek H5 deployable root. Authority: `../../../sdkwork-specs/SOURCE_CONFIG_SPEC.md`, `ENVIRONMENT_SPEC.md`.

## Entrypoint

- Profile index: `sdkwork.deployment.config.json` (`kind: sdkwork.component-deployment`) — maps each `<deploymentProfile>.<environment>` profile id to its browser runtime source. This is an index, not a value store.
- Browser runtime sources: `browser/runtime-env.<profileId>.json` — the deploy-time identity documents (`environment`, `deploymentProfile`, `profileId`, `runtimeTarget`, `browserOriginMode`, same-origin `/` base URLs).

## Supported profiles

Standalone-only milestone: `standalone.development` (default), `standalone.test`, `standalone.staging`, `standalone.production`. Cloud profiles (`cloud.*`) are intentionally absent until Phase 2 platform wiring (`runtime.supportedDeploymentProfiles: ["standalone"]` in the app manifest exempts the repository from the `:cloud` build family).

## Materialization and validation

- The canonical build runner (`node ../../../sdkwork-specs/tools/build-browser-client.mjs --app-root . --environment <dev|test|staging|prod>`) validates the selected source (profile identity + same-origin `/` base URLs) and materializes it to `../public/runtime-env.json` before Vite runs.
- Validation: `node ../../../sdkwork-specs/tools/check-source-config-standard.mjs --root . --enforce-profile-identity`

## Rules

- Concrete environment, runtime, and base-URL values belong here — never in `sdkwork.app.config.json` and never in component code.
- No secrets: committed `etc/` files carry no tokens or credentials. Local-only overrides live in ignored `etc/**/*.local.*` files.
- Standalone profiles serve from the same origin; every SDK base URL stays `/`.

## sdkwork-im driver keys (messages + contacts capabilities)

- `sdkworkImApiBaseUrl` — IM gateway base for the messages and contacts ports (`@sdkwork/im-sdk`, `/im/v3/api`). Empty string (all four standalone profiles) keeps the mock clients: the standalone milestone mounts no IM gateway. Set a same-origin path (for example `/im/v3/api`) when a gateway is mounted behind the same origin, or an absolute URL for an explicit topology override (cloud Phase 2).
- `sdkworkImWebSocketBaseUrl` — explicit CCP websocket base (`wss://…`); leave empty to let `@sdkwork/im-sdk` derive it (same-origin standalone mounts should set it explicitly).
- `sdkworkImBootstrapAccessToken` / `sdkworkImBootstrapAuthToken` — pre-minted IAM session for the composed client's shared TokenManager (dual-token `Access-Token`/`Auth-Token` headers). Operator bridge until the IAM login runtime lands: mint from the gateway's own IAM credential-entry surface (`POST /app/v3/api/auth/sessions`), then set both values in a LOCAL (uncommitted) profile copy. Empty (all committed profiles) starts the session empty — the gateway rejects unauthenticated calls.
- These keys are intentionally absent from `ENVIRONMENT_SPEC` standard `SDK_BASE_URL_KEYS` materialization: they configure a single optional dependency driver, not the application API surface.
