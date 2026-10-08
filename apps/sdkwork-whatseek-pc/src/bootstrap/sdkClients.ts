/**
 * App bootstrap: runtime environment + SDK client registration (APP_PC
 * ARCHITECTURE_SPEC.md bootstrap composition; APP_SDK_INTEGRATION_SPEC.md §1).
 * This is the composition root — the only place that constructs SDK clients.
 *
 * sdkwork-im driver (messages + contacts capabilities): when the runtime
 * environment declares an IM API base URL (`sdkworkImApiBaseUrl` from
 * etc/browser runtime-env sources), one composed `@sdkwork/im-sdk` client is
 * constructed with one session TokenManager and injected into both port
 * adapters; otherwise both ports stay on the Phase-1 mock clients (standalone
 * milestone default).
 *
 * sdkwork-appstore driver (apps capability): same activation rule over
 * `sdkworkAppstoreApiBaseUrl` — one composed `@sdkwork/appstore-app-sdk`
 * client feeds the AppsPort home feed / catalog; whatseek-local user scope
 * (recent, favorites, 我的应用) stays on the mock client inside the adapter.
 * Remaining ports stay on mock clients until their SDK families land.
 */

import { createTokenManager } from '@sdkwork/sdk-common';
import { createAppStoreClient, type AppStoreClient } from '@sdkwork/appstore-app-sdk';
import { ImSdkClient, type ImSdkClientOptions } from '@sdkwork/im-sdk';
import { createAppstoreAppsClient, createMockAppsClient } from '@sdkwork/whatseek-pc-apps';
import { createMockChatClient, createMockTasksClient } from '@sdkwork/whatseek-pc-chat';
import {
  createImContactsClient,
  createMockContactsClient,
} from '@sdkwork/whatseek-pc-contacts';
import {
  getCurrentUser,
  registerWhatseekClient,
  type AppsPort,
  type ContactsPort,
  type MessagesPort,
  type WhatseekRuntimeEnvironment,
} from '@sdkwork/whatseek-pc-core';
import { createImMessagesClient, createMockMessagesClient } from '@sdkwork/whatseek-pc-messages';

import { currentRuntimeEnvironment } from './environment.js';

/**
 * Construct the composed IM client for the resolved runtime environment, or
 * `null` when no IM gateway is declared (mock-driver standalone milestone).
 * Exported for bootstrap tests; production code goes through
 * `bootstrapSdkClients`.
 */
export function createImSdkClient(env: WhatseekRuntimeEnvironment): ImSdkClient | null {
  const apiBaseUrl = env.sdkworkImApiBaseUrl?.trim() ?? '';
  if (apiBaseUrl.length === 0) {
    return null;
  }
  // TokenManager closure rule (APP_SDK_INTEGRATION_SPEC.md: one manager per
  // authenticated session context, shared by every SDK client). Tokens come
  // from the IAM login runtime (Phase 2) or, until that lands, from the
  // operator-declared `sdkworkImBootstrap*` runtime-env bridge (minted by the
  // gateway's own IAM credential-entry surface); empty starts the session
  // empty and the IM gateway rejects unauthenticated calls, so the driver
  // only activates when a gateway is actually mounted.
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
  const options: ImSdkClientOptions = {
    apiBaseUrl,
    ...(websocketBaseUrl.length > 0 ? { websocketBaseUrl } : {}),
    platform: 'pc',
    tokenManager,
  };
  return new ImSdkClient(options);
}

/**
 * Build the messages port. `im === null` selects the mock driver.
 */
export function createMessagesClient(im: ImSdkClient | null): MessagesPort {
  if (im === null) {
    return createMockMessagesClient();
  }
  return createImMessagesClient({
    gateway: {
      conversations: im.conversations,
      connect: (options) => im.connect(options),
    },
    currentUserId: () => getCurrentUser()?.id ?? 'visitor',
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
 * Construct the composed appstore client for the resolved runtime environment,
 * or `null` when no appstore gateway is declared (mock-driver standalone
 * milestone). Same TokenManager closure rule as the IM driver; tokens come
 * from the operator-declared `sdkworkAppstoreBootstrap*` runtime-env bridge
 * until the IAM login runtime lands (APP_SDK_INTEGRATION_SPEC.md §4).
 * Exported for bootstrap tests; production code goes through
 * `bootstrapSdkClients`.
 */
export function createAppstoreSdkClient(env: WhatseekRuntimeEnvironment): AppStoreClient | null {
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
  return createAppStoreClient({ baseUrl: apiBaseUrl, tokenManager, platform: 'pc' });
}

/**
 * Build the apps port. `appstore === null` selects the mock driver.
 */
export function createAppsClient(appstore: AppStoreClient | null): AppsPort {
  if (appstore === null) {
    return createMockAppsClient();
  }
  return createAppstoreAppsClient({ gateway: appstore.catalog });
}

export function bootstrapSdkClients(): void {
  // bootstrapSdkClients runs after bootstrapEnvironment() in main.tsx, so the
  // environment cache is populated; test runtimes without an environment
  // bootstrap land on the standalone.development fallback.
  const env = currentRuntimeEnvironment();
  const im = createImSdkClient(env);
  const appstore = createAppstoreSdkClient(env);
  const apps = createAppsClient(appstore);
  const contacts = createContactsClient(im);
  const messages = createMessagesClient(im);
  const tasks = createMockTasksClient();
  const chat = createMockChatClient({ apps, contacts, messages, tasks });

  registerWhatseekClient('apps', apps);
  registerWhatseekClient('contacts', contacts);
  registerWhatseekClient('messages', messages);
  registerWhatseekClient('tasks', tasks);
  registerWhatseekClient('chat', chat);
}
