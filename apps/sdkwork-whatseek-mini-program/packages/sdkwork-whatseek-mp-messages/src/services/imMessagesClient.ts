/**
 * Messages capability: the adapter is owned by the shared common family
 * (`@sdkwork/whatseek-service-core`, APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md
 * SDK adapter boundaries); this module re-exports it for this surface's
 * public capability boundary.
 */

export { createImMessagesClient, type ImMessagesClientOptions, type ImMessagesGateway } from '@sdkwork/whatseek-service-core';
