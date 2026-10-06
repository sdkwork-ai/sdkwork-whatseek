# etc/ — Source Configuration (apps/sdkwork-whatseek-mini-program)

Source configuration for the WhatSeek WeChat mini-program deployable root. Authority: `../../../sdkwork-specs/SOURCE_CONFIG_SPEC.md`.

- Profile index: `sdkwork.deployment.config.json` (`kind: sdkwork.component-deployment`) mapping each standalone profile to its mini-program runtime source.
- Runtime sources: `../config/mini-program/runtime-env.<profileId>.json` (`runtimeTarget: "mini-program"`), consumed by `scripts/build-runtime.mjs` which injects them into the bundled runtime document.
- `sdkworkImApiBaseUrl` — IM gateway base for the messages and contacts ports (`@sdkwork/im-sdk`, `/im/v3/api`). Empty string (all four standalone profiles) keeps the mock clients: the standalone milestone mounts no IM gateway. Set an absolute URL when a gateway is mounted — the mini-program runtime has no same-origin concept, so a relative path cannot resolve.
- `sdkworkImWebSocketBaseUrl` — explicit CCP websocket base (`wss://…`); leave empty to let `@sdkwork/im-sdk` derive it from the API base. The composed client runs with the `wx.connectSocket`-backed realtime factory installed by the bootstrap composition root.
- Standalone-only milestone; cloud profiles arrive with Phase 2 platform wiring.
