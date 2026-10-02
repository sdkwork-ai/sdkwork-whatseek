# apps/

Governed directory index for `sdkwork-whatseek` application roots. This index follows `../sdkwork-specs/DOCUMENTATION_SPEC.md` §3.3 and the workspace ownership rules in `../sdkwork-specs/SDKWORK_WORKSPACE_SPEC.md`; application root structure follows `../sdkwork-specs/APPLICATION_SPEC.md`.

The repository root is not the primary runnable app surface. The primary runnable H5 application root is `apps/sdkwork-whatseek-h5/`.

## Index

| Directory | Surface role | Runnable | Purpose | Entry |
| --- | --- | --- | --- | --- |
| `sdkwork-whatseek-common/` | Shared package family (not runnable) | No | Cross-architecture contracts, service ports, and domain logic (route identity, intent rules, service core) | `sdkwork-whatseek-common/README.md` |
| `sdkwork-whatseek-h5/` | Primary application surface (mobile-first H5) | Yes | WhatSeek AI-native super app: chat-first entry, app center, contacts, messages, profile | `sdkwork-whatseek-h5/README.md` |
| `sdkwork-whatseek-pc/` | PC surface (desktop-class browser + Tauri desktop shell) | Yes | Productivity layout (navigation rail) with the same five tabs; desktop host `packages/sdkwork-whatseek-pc-tauri` | `sdkwork-whatseek-pc/README.md` |
| `sdkwork-whatseek-mini-program/` | WeChat mini-program surface | Yes (WeChat DevTools) | Native tabBar pages projected from the same route identities | `sdkwork-whatseek-mini-program/README.md` |
| `sdkwork-whatseek-flutter-mobile/` | Flutter mobile surface (iOS/Android) | Yes (flutter) | Dart package family mirroring the five tabs; `flutter pub get/analyze/test` verified | `sdkwork-whatseek-flutter-mobile/README.md` |

## Allowed Content

- Application roots, each with `README.md`, `AGENTS.md`, `.sdkwork/`, `specs/`, and architecture-local `packages/ config/ src/ lib/ etc/ docs/ public/ scripts/ sdks/ tests/`.
- Surface root names `MUST` follow `../sdkwork-specs/APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` §1 (`apps/sdkwork-whatseek-{common,h5,pc,mini-program,flutter-mobile}/`).

## Forbidden Content

- API contracts, Rust crates, deploy descriptors, or secrets under `apps/` (the generated API assembly scaffold lives at the repository root).
- Cross-surface imports of another surface's UI implementations, routes, or private `src/` internals — shared logic flows only through `sdkwork-whatseek-common`.

## Related Specs

- `../sdkwork-specs/APPLICATION_SPEC.md`
- `../sdkwork-specs/SDKWORK_WORKSPACE_SPEC.md`
- `../sdkwork-specs/APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`

## Verification

```bash
node ../sdkwork-specs/tools/check-apps-directory-index.mjs --root .
```
