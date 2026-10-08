/**
 * Shared SDK driver factories of the sdkwork-whatseek common family — the
 * composed-client construction the surface composition roots invoke with their
 * surface identity (APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md: the common
 * family owns runtime/bootstrap helpers and SDK adapter boundaries;
 * APP_SDK_INTEGRATION_SPEC.md §1: each surface's bootstrap stays the only
 * place that triggers construction, one client per session context).
 *
 * The environment parameter is structural: every surface's runtime environment
 * (h5/pc `WhatseekRuntimeEnvironment`, mp `MiniProgramRuntimeConfig`) carries
 * these optional driver keys. Empty base URLs select the Phase-1 mock clients
 * (standalone milestone default).
 */

import { createTokenManager } from '@sdkwork/sdk-common';
import { ImSdkClient, type ImSdkClientOptions, type ImWebSocketFactory } from '@sdkwork/im-sdk';
import { createAppStoreClient, type AppStoreClient } from '@sdkwork/appstore-app-sdk';

import type { AppsPort, ContactsPort, MessagesPort } from '../ports.js';
import { createMockAppsClient } from '../apps/appsClient.js';
import { createMockContactsClient } from '../contacts/contactsClient.js';
import { createMockMessagesClient } from '../messages/messagesClient.js';
import { createAppstoreAppsClient } from './appstoreAppsClient.js';
import { createImContactsClient } from './imContactsClient.js';
import { createImMessagesClient } from './imMessagesClient.js';

/** Driver source keys every surface runtime environment declares. */
export interface WhatseekSdkDriverEnv {
  sdkworkImApiBaseUrl?: string;
  sdkworkImWebSocketBaseUrl?: string;
  sdkworkImBootstrapAccessToken?: string;
  sdkworkImBootstrapAuthToken?: string;
  sdkworkAppstoreApiBaseUrl?: string;
  sdkworkAppstoreBootstrapAccessToken?: string;
  sdkworkAppstoreBootstrapAuthToken?: string;
}

export interface ImSdkDriverOptions {
  /** Surface identity stamped on the composed IM client. */
  platform: 'h5' | 'pc' | 'mini-program';
  /** Mini-program transport override (`wx.connectSocket`-backed factory). */
  webSocketFactory?: ImWebSocketFactory;
}

/**
 * Construct the composed IM client for the resolved runtime environment, or
 * `null` when no IM gateway is declared (mock-driver standalone milestone).
 * TokenManager closure rule (APP_SDK_INTEGRATION_SPEC.md: one manager per
 * authenticated session context, shared by every SDK client). Tokens come
 * from the IAM login runtime (Phase 2) or, until that lands, from the
 * operator-declared `sdkworkImBootstrap*` runtime-env bridge (minted by the
 * gateway's own IAM credential-entry surface); empty starts the session empty
 * and the IM gateway rejects unauthenticated calls, so the driver only
 * activates when a gateway is actually mounted.
 */
export function createImSdkClient(env: WhatseekSdkDriverEnv, options: ImSdkDriverOptions): ImSdkClient | null {
  const apiBaseUrl = env.sdkworkImApiBaseUrl?.trim() ?? '';
  if (apiBaseUrl.length === 0) {
    return null;
  }
  const tokenManager = createTokenManager();
  const bootstrapAccessToken = env.sdkworkImBootstrapAccessToken?.trim() ?? '';
  const bootstrapAuthToken = env.sdkworkImBootstrapAuthToken?.trim() ?? '';
  if (bootstrapAccessToken.length > 0 || bootstrapAuthToken.length > 0) {
    tokenManager.setTokens({
      ...(bootstrapAccessToken.length > 0 ? { accessToken: bootstrapAccessToken } : {}),
      ...(bootstrapAuthToken.length > 0 ? { authToken: bootstrapAuthToken } : {}),
    });
  }
  const websocketBaseUrl = env.sdkworkImWebSocketBaseUrl?.trim() ?? '';
  const clientOptions: ImSdkClientOptions = {
    apiBaseUrl,
    ...(websocketBaseUrl.length > 0 ? { websocketBaseUrl } : {}),
    platform: options.platform,
    tokenManager,
    ...(options.webSocketFactory !== undefined ? { webSocketFactory: options.webSocketFactory } : {}),
  };
  return new ImSdkClient(clientOptions);
}

export interface AppstoreSdkDriverOptions {
  /** Surface identity stamped on the composed appstore client. */
  platform: 'h5' | 'pc' | 'mini-program';
}

/**
 * Construct the composed appstore client for the resolved runtime environment,
 * or `null` when no appstore gateway is declared (mock-driver standalone
 * milestone). Same TokenManager closure rule as the IM driver; tokens come
 * from the operator-declared `sdkworkAppstoreBootstrap*` runtime-env bridge
 * until the IAM login runtime lands (APP_SDK_INTEGRATION_SPEC.md §4).
 */
export function createAppstoreSdkClient(
  env: WhatseekSdkDriverEnv,
  options: AppstoreSdkDriverOptions,
): AppStoreClient | null {
  const apiBaseUrl = env.sdkworkAppstoreApiBaseUrl?.trim() ?? '';
  if (apiBaseUrl.length === 0) {
    return null;
  }
  const tokenManager = createTokenManager();
  const bootstrapAccessToken = env.sdkworkAppstoreBootstrapAccessToken?.trim() ?? '';
  const bootstrapAuthToken = env.sdkworkAppstoreBootstrapAuthToken?.trim() ?? '';
  if (bootstrapAccessToken.length > 0 || bootstrapAuthToken.length > 0) {
    tokenManager.setTokens({
      ...(bootstrapAccessToken.length > 0 ? { accessToken: bootstrapAccessToken } : {}),
      ...(bootstrapAuthToken.length > 0 ? { authToken: bootstrapAuthToken } : {}),
    });
  }
  return createAppStoreClient({ baseUrl: apiBaseUrl, tokenManager, platform: options.platform });
}

/**
 * Build the messages port. `im === null` selects the mock driver; the surface
 * supplies its session-principal accessor (bootstrap-only dependency).
 */
export function createMessagesClient(
  im: ImSdkClient | null,
  options: { currentUserId: () => string },
): MessagesPort {
  if (im === null) {
    return createMockMessagesClient();
  }
  return createImMessagesClient({
    gateway: {
      conversations: im.conversations,
      connect: (connectOptions) => im.connect(connectOptions),
    },
    currentUserId: options.currentUserId,
  });
}

/**
 * Build the contacts port from the same composed IM client (no second client,
 * no second TokenManager). `im === null` selects the mock driver.
 */
export function createContactsClient(im: ImSdkClient | null): ContactsPort {
  if (im === null) {
    return createMockContactsClient();
  }
  return createImContactsClient({
    gateway: { contacts: im.social.contacts },
  });
}

/**
 * Build the apps port. `appstore === null` selects the mock driver. The
 * adapter gateway assembles the catalog facade, the listings slice (detail
 * enrichment) and the wishlist slice (server-side 收藏) from the one composed
 * client.
 */
export function createAppsClient(appstore: AppStoreClient | null): AppsPort {
  if (appstore === null) {
    return createMockAppsClient();
  }
  return createAppstoreAppsClient({
    gateway: {
      ...appstore.catalog,
      get: appstore.listings.get,
      listMedia: appstore.listings.listMedia,
      listItems: appstore.wishlist.listItems,
      addItem: appstore.wishlist.addItem,
      removeItem: appstore.wishlist.removeItem,
    },
  });
}
