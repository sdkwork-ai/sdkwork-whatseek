# sdkwork-whatseek-common

Shared cross-architecture package-family root for WhatSeek (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` line 56): contracts, service ports, and domain logic with **no UI runtime dependency**. Not a runnable client surface.

| Package | Purpose | Consumers |
| --- | --- | --- |
| `sdkwork-whatseek-route-core` | Route identity contract (`<surface>.<domain>.<capability>.<screen>`), tab definitions, table validation/composition. | h5, pc, mini-program (Flutter re-declares aligned ids in Dart) |
| `sdkwork-whatseek-intent-core` | PRD §10.1 intent set + rule-based recognizer (zh-CN/en-US). | h5-chat, pc-chat, mp runtime |

Rules: packages here MUST NOT import any surface's UI implementations, and surface packages MUST NOT import each other's internals — cross-surface reuse flows only through this root plus aligned route ids / i18n keys / design tokens.
