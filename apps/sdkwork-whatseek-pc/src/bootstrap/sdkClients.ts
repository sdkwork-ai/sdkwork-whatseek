/**
 * App bootstrap: runtime environment + SDK client registration (APP_PC
 * ARCHITECTURE_SPEC.md bootstrap composition). The composed-client factories
 * live in the shared common family (`@sdkwork/whatseek-service-core`,
 * `sdk/driverClients`); this composition root is the only place that invokes
 * them with the pc surface identity and registers the resulting ports
 * (APP_SDK_INTEGRATION_SPEC.md §1). The thin wrappers below pin the platform
 * and the session-principal accessor so the rest of the surface stays
 * driver-agnostic.
 */

import type { AppStoreClient } from '@sdkwork/appstore-app-sdk';
import type { ImSdkClient } from '@sdkwork/im-sdk';
import { createMockChatClient, createMockTasksClient } from '@sdkwork/whatseek-pc-chat';
import {
  getCurrentUser,
  registerWhatseekClient,
  type AppsPort,
  type ContactsPort,
  type MessagesPort,
  type WhatseekRuntimeEnvironment,
} from '@sdkwork/whatseek-pc-core';
import {
  createAppsClient as createSharedAppsClient,
  createAppstoreSdkClient as createSharedAppstoreSdkClient,
  createContactsClient as createSharedContactsClient,
  createImSdkClient as createSharedImSdkClient,
  createMessagesClient as createSharedMessagesClient,
} from '@sdkwork/whatseek-service-core';

import { currentRuntimeEnvironment } from './environment.js';

/** Surface identity stamped onto every composed SDK client. */
const PLATFORM = 'pc' as const;

/**
 * Composed IM client for the resolved runtime environment, or `null` when no
 * IM gateway is declared (mock-driver standalone milestone). Exported for
 * bootstrap tests; production code goes through `bootstrapSdkClients`.
 */
export function createImSdkClient(env: WhatseekRuntimeEnvironment): ImSdkClient | null {
  return createSharedImSdkClient(env, { platform: PLATFORM });
}

/**
 * Composed appstore client for the resolved runtime environment, or `null`
 * when no appstore gateway is declared. Exported for bootstrap tests;
 * production code goes through `bootstrapSdkClients`.
 */
export function createAppstoreSdkClient(env: WhatseekRuntimeEnvironment): AppStoreClient | null {
  return createSharedAppstoreSdkClient(env, { platform: PLATFORM });
}

/**
 * Build the messages port. `im === null` selects the mock driver.
 */
export function createMessagesClient(im: ImSdkClient | null): MessagesPort {
  return createSharedMessagesClient(im, {
    currentUserId: () => getCurrentUser()?.id ?? 'visitor',
  });
}

/**
 * Build the contacts port from the same composed IM client (no second client,
 * no second TokenManager). `im === null` selects the mock driver.
 */
export function createContactsClient(im: ImSdkClient | null): ContactsPort {
  return createSharedContactsClient(im);
}

/**
 * Build the apps port. `appstore === null` selects the mock driver.
 */
export function createAppsClient(appstore: AppStoreClient | null): AppsPort {
  return createSharedAppsClient(appstore);
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
