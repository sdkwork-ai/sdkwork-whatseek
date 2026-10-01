# sdkwork-whatseek-route-core

Cross-architecture route identity contract for WhatSeek (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`): the `TabId` set, the fixed five-tab definitions, the `<surface>.<domain>.<capability>.<screen>` identity shape, and table validation/composition. Pure framework-agnostic TypeScript — no UI, no DOM, no platform APIs.

Consumed by the H5, PC, and mini-program surfaces; the Flutter surface re-declares the aligned route ids in Dart and asserts the same contract in its own route alignment test.
