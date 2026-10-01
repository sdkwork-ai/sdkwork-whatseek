# config/browser

Browser runtime-env examples and hosting notes (APP_H5 §2). The tracked per-profile runtime sources live in `../../etc/browser/`; this directory documents the contract for future hosting integrations.

- Runtime document identity: `environment`, `deploymentProfile`, `profileId`, `runtimeTarget: "browser"`, `browserOriginMode`.
- Standalone: same-origin `/` for every SDK base URL. Cloud (Phase 2): unified `api-<suffix>.<domain>` edge origins.
