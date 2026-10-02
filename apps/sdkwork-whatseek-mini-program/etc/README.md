# etc/ — Source Configuration (apps/sdkwork-whatseek-mini-program)

Source configuration for the WhatSeek WeChat mini-program deployable root. Authority: `../../../sdkwork-specs/SOURCE_CONFIG_SPEC.md`.

- Profile index: `sdkwork.deployment.config.json` (`kind: sdkwork.component-deployment`) mapping each standalone profile to its mini-program runtime source.
- Runtime sources: `../config/mini-program/runtime-env.<profileId>.json` (`runtimeTarget: "mini-program"`), consumed by `scripts/build-runtime.mjs` which injects them into the bundled runtime document.
- Standalone-only milestone; cloud profiles arrive with Phase 2 platform wiring.
