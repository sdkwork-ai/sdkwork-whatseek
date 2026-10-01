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
