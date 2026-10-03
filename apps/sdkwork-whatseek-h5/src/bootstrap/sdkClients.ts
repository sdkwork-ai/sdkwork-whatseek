/**
 * App bootstrap: runtime environment + SDK client registration (APP_H5
 * ARCHITECTURE_SPEC.md §2 `src/bootstrap/*`). This is the composition root —
 * the only place that constructs SDK clients (APP_SDK_INTEGRATION_SPEC.md §1).
 *
 * Messages driver selection: when the runtime environment declares an IM API
 * base URL (`sdkworkImApiBaseUrl` from etc/browser runtime-env sources), the
 * messages port is backed by the sdkwork-im composed consumer package
 * `@sdkwork/im-sdk`; otherwise the Phase-1 mock client serves the standalone
 * milestone. All other ports stay on mock clients until their SDK families
 * land.
 */

import { createTokenManager } from '@sdkwork/sdk-common';
import { ImSdkClient } from '@sdkwork/im-sdk';
import { createMockAppsClient } from '@sdkwork/whatseek-h5-apps';
import { createMockChatClient, createMockTasksClient } from '@sdkwork/whatseek-h5-chat';
import { createMockContactsClient } from '@sdkwork/whatseek-h5-contacts';
import {
  getCurrentUser,
  registerWhatseekClient,
  type MessagesPort,
  type WhatseekRuntimeEnvironment,
} from '@sdkwork/whatseek-h5-core';
import { createImMessagesClient, createMockMessagesClient } from '@sdkwork/whatseek-h5-messages';

import { currentRuntimeEnvironment } from './environment.js';

/**
 * Build the messages port for the resolved runtime environment. Exported for
 * bootstrap tests; production code goes through `bootstrapSdkClients`.
 */
export function createMessagesClient(env: WhatseekRuntimeEnvironment): MessagesPort {
  const apiBaseUrl = env.sdkworkImApiBaseUrl?.trim() ?? '';
  if (apiBaseUrl.length === 0) {
    return createMockMessagesClient();
  }
  // TokenManager closure rule (APP_SDK_INTEGRATION_SPEC.md: one manager per
  // authenticated session context, shared by every SDK client). Tokens are
  // fed by the Phase-2 IAM runtime; the standalone milestone starts empty and
  // the IM gateway rejects unauthenticated calls, so the driver only activates
  // when a gateway is actually mounted.
  const tokenManager = createTokenManager();
  const websocketBaseUrl = env.sdkworkImWebSocketBaseUrl?.trim() ?? '';
  const im = new ImSdkClient({
    apiBaseUrl,
    ...(websocketBaseUrl.length > 0 ? { websocketBaseUrl } : {}),
    platform: 'h5',
    tokenManager,
  });
  return createImMessagesClient({
    gateway: {
      conversations: im.conversations,
      connect: (options) => im.connect(options),
    },
    currentUserId: () => getCurrentUser()?.id ?? 'visitor',
  });
}

export function bootstrapSdkClients(): void {
  // bootstrapSdkClients runs after bootstrapEnvironment() in main.tsx, so the
  // environment cache is populated; test runtimes without an environment
  // bootstrap land on the standalone.development fallback.
  const env = currentRuntimeEnvironment();
  const apps = createMockAppsClient();
  const contacts = createMockContactsClient();
  const messages = createMessagesClient(env);
  const tasks = createMockTasksClient();
  const chat = createMockChatClient({ apps, contacts, messages, tasks });

  registerWhatseekClient('apps', apps);
  registerWhatseekClient('contacts', contacts);
  registerWhatseekClient('messages', messages);
  registerWhatseekClient('tasks', tasks);
  registerWhatseekClient('chat', chat);
}
