/**
 * Contacts capability: the adapter is owned by the shared common family
 * (`@sdkwork/whatseek-service-core`, APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md
 * SDK adapter boundaries); this module re-exports it for this surface's
 * public capability boundary.
 */

export { createImContactsClient, type ImContactsClientOptions, type ImContactsGateway } from '@sdkwork/whatseek-service-core';
