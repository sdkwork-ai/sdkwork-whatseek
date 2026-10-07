/**
 * App bootstrap: runtime environment + SDK client registration (APP_H5
 * ARCHITECTURE_SPEC.md §2 `src/bootstrap/*`). This is the composition root —
 * the only place that constructs SDK clients (APP_SDK_INTEGRATION_SPEC.md §1).
 *
 * sdkwork-im driver (messages + contacts capabilities): when the runtime
 * environment declares an IM API base URL (`sdkworkImApiBaseUrl` from
 * etc/browser runtime-env sources), one composed `@sdkwork/im-sdk` client is
 * constructed with one session TokenManager and injected into both port
 * adapters; otherwise both ports stay on the Phase-1 mock clients (standalone
 * milestone default). All other ports stay on mock clients until their SDK
 * families land.
 */

import { createTokenManager } from '@sdkwork/sdk-common';
import { ImSdkClient, type ImSdkClientOptions } from '@sdkwork/im-sdk';
import { createMockAppsClient } from '@sdkwork/whatseek-h5-apps';
import { createMockChatClient, createMockTasksClient } from '@sdkwork/whatseek-h5-chat';
import {
  createImContactsClient,
  createMockContactsClient,
} from '@sdkwork/whatseek-h5-contacts';
import {
  getCurrentUser,
  registerWhatseekClient,
  type ContactsPort,
  type MessagesPort,
  type WhatseekRuntimeEnvironment,
} from '@sdkwork/whatseek-h5-core';
import { createImMessagesClient, createMockMessagesClient } from '@sdkwork/whatseek-h5-messages';

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
    platform: 'h5',
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

export function bootstrapSdkClients(): void {
  // bootstrapSdkClients runs after bootstrapEnvironment() in main.tsx, so the
  // environment cache is populated; test runtimes without an environment
  // bootstrap land on the standalone.development fallback.
  const env = currentRuntimeEnvironment();
  const im = createImSdkClient(env);
  const apps = createMockAppsClient();
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
