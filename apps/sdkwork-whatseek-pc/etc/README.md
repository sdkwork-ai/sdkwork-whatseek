# etc/ — Source Configuration (apps/sdkwork-whatseek-pc)

Source configuration for the WhatSeek PC deployable root. Authority: `../../../sdkwork-specs/SOURCE_CONFIG_SPEC.md`.

- Profile index: `sdkwork.deployment.config.json` (`kind: sdkwork.component-deployment`) mapping each standalone profile to its browser runtime source.
- Browser runtime sources: `browser/runtime-env.<profileId>.json` — deploy-time identity documents (same-origin `/` base URLs).
- The canonical build runner validates the selected source and materializes it to `../public/runtime-env.json` before Vite runs.
- `sdkworkImApiBaseUrl` — IM gateway base for the messages and contacts ports (`@sdkwork/im-sdk`, `/im/v3/api`). Empty string (all four standalone profiles) keeps the mock clients: the standalone milestone mounts no IM gateway. Set a same-origin path (for example `/im/v3/api`) when a gateway is mounted behind the same origin, or an absolute URL for an explicit topology override (cloud Phase 2).
- `sdkworkImWebSocketBaseUrl` — explicit CCP websocket base (`wss://…`); leave empty to let `@sdkwork/im-sdk` derive it (same-origin standalone mounts should set it explicitly).
- Standalone-only milestone; cloud profiles arrive with Phase 2 platform wiring.
