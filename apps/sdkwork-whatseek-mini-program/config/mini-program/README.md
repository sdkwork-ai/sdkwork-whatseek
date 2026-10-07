# config/mini-program

Per-profile runtime-env sources for the WeChat mini-program surface (MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md §Config): `runtime-env.<profileId>.json` declares `SDKWORK_RUNTIME_TARGET=mini-program` plus matching environment/profile identity.


## sdkwork-im driver keys (messages + contacts capabilities)

- `sdkworkImApiBaseUrl` (+ `sdkworkImWebSocketBaseUrl`) — IM gateway base for the messages and contacts ports (`@sdkwork/im-sdk`); absolute URL only. Empty (all four committed profiles) keeps the mock clients.
- `sdkworkImBootstrapAccessToken` / `sdkworkImBootstrapAuthToken` — pre-minted IAM session for the composed client's shared TokenManager (dual-token `Access-Token`/`Auth-Token` headers). Operator bridge until the IAM login runtime lands: mint from the gateway's own IAM credential-entry surface (`POST /app/v3/api/auth/sessions`), then set both values in a LOCAL (uncommitted) profile copy and rebuild with `pnpm build`. Empty (all committed profiles) starts the session empty — the gateway rejects unauthenticated calls.