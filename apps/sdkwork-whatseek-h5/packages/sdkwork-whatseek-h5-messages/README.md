# sdkwork-whatseek-h5-messages

消息 (Messages) capability package for the WhatSeek H5 app. Follows the global standards via specs/component.spec.json canonicalSpecs links.

## Services

- `createMockMessagesClient` — Phase-1 mock `MessagesPort` (localStorage persistence), re-exported from `@sdkwork/whatseek-service-core`; the standalone-milestone default.
- `createImMessagesClient` — sdkwork-im backed `MessagesPort` (first landed SDK family). Receives a narrow `ImMessagesGateway` slice of the composed `@sdkwork/im-sdk` client (`/im/v3/api`) injected from app bootstrap (`apps/sdkwork-whatseek-h5/src/bootstrap/sdkClients.ts`, the only client construction site per APP_SDK_INTEGRATION_SPEC.md §1); maps IM inbox/history/read cursors onto the shared port, provisions per-task system channels idempotently, and forwards CCP realtime activity through the optional `MessagesPort.events` surface.

## Driver selection

Runtime-environment driven: a non-empty `sdkworkImApiBaseUrl` in `etc/browser/runtime-env.<profileId>.json` activates the IM adapter; empty (all standalone profiles today) keeps the mock client. See `etc/README.md` in the H5 app root.
