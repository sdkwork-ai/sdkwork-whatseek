# etc/ — Source Configuration (apps/sdkwork-whatseek-pc)

Source configuration for the WhatSeek PC deployable root. Authority: `../../../sdkwork-specs/SOURCE_CONFIG_SPEC.md`.

- Profile index: `sdkwork.deployment.config.json` (`kind: sdkwork.component-deployment`) mapping each standalone profile to its browser runtime source.
- Browser runtime sources: `browser/runtime-env.<profileId>.json` — deploy-time identity documents (same-origin `/` base URLs).
- The canonical build runner validates the selected source and materializes it to `../public/runtime-env.json` before Vite runs.
- Standalone-only milestone; cloud profiles arrive with Phase 2 platform wiring.
