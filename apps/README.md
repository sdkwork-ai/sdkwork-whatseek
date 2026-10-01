# apps/

Governed directory index for `sdkwork-whatseek` application roots. This index follows `../sdkwork-specs/DOCUMENTATION_SPEC.md` §3.3 and the workspace ownership rules in `../sdkwork-specs/SDKWORK_WORKSPACE_SPEC.md`; application root structure follows `../sdkwork-specs/APPLICATION_SPEC.md`.

## Index

| Directory | Surface role | Runnable | Purpose | Entry |
| --- | --- | --- | --- | --- |
| `sdkwork-whatseek-h5/` | Primary application surface (mobile-first H5) | Yes | WhatSeek AI-native super app: chat-first entry, app center, contacts, messages, profile | `apps/sdkwork-whatseek-h5/README.md` |

## Allowed Content

- Application roots, each with `README.md`, `AGENTS.md`, `.sdkwork/`, `specs/`, and architecture-local `packages/ config/ src/ etc/ docs/ public/ scripts/ sdks/ tests/`.
- H5 application roots `MUST` use the name `apps/sdkwork-whatseek-h5/` per `../sdkwork-specs/APP_H5_ARCHITECTURE_SPEC.md` §2.

## Forbidden Content

- API contracts, Rust crates, deploy descriptors, or secrets under `apps/`.
- Competing top-level names (`api/`, `sdk/`, `package/`, `packages/`, `config/`, `deploy/`, `deployment/`, `tooling/`).

## Related Specs

- `../sdkwork-specs/APPLICATION_SPEC.md`
- `../sdkwork-specs/SDKWORK_WORKSPACE_SPEC.md`
- `../sdkwork-specs/APP_H5_ARCHITECTURE_SPEC.md`

## Verification

```bash
node ../sdkwork-specs/tools/check-apps-directory-index.mjs --root .
```

## Primary App Surface

The repository root is not the primary runnable app surface. The primary runnable H5 application root is `apps/sdkwork-whatseek-h5/`; its `apps/sdkwork-whatseek-h5/sdkwork.app.config.json` governs the surface manifest.
