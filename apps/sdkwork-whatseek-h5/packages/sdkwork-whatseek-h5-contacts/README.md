# sdkwork-whatseek-h5-contacts

通讯录 (Contacts) capability package for the WhatSeek H5 app. Follows the global standards via specs/component.spec.json canonicalSpecs links.

## Services

- `createMockContactsClient` — Phase-1 mock `ContactsPort` (seeded address book), re-exported from `@sdkwork/whatseek-service-core`; the standalone-milestone default.
- `createImContactsClient` — sdkwork-im backed `ContactsPort`. Receives the narrow `ImContactsGateway` slice (`social.contacts`) of the composed `@sdkwork/im-sdk` client shared with the messages adapter, injected from app bootstrap (`apps/sdkwork-whatseek-h5/src/bootstrap/sdkClients.ts`, the only client construction site per APP_SDK_INTEGRATION_SPEC.md §1). IM contact views map onto the whatseek `Contact` model (remark → bio, deterministic avatar glyph); the server contacts list has no search parameter, so `searchContacts` filters the mapped address book client-side — the same semantics as the mock port.

## Driver selection

Runtime-environment driven: a non-empty `sdkworkImApiBaseUrl` in `etc/browser/runtime-env.<profileId>.json` activates the IM adapter (shared with the messages driver); empty (all standalone profiles today) keeps the mock client. See `etc/README.md` in the H5 app root.
