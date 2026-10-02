/**
 * Shared test runtime: registers the mock clients with deterministic timing
 * and creates the i18n instance from the same merged resources as the app.
 */

import { createWhatseekI18n, mergeWhatseekResources, resetWhatseekClients, registerWhatseekClient } from '@sdkwork/whatseek-pc-core';
import { commonsI18nResources } from '@sdkwork/whatseek-pc-commons';
import { shellI18nResources } from '@sdkwork/whatseek-pc-shell';
import { chatI18nResources, createMockChatClient, createMockTasksClient } from '@sdkwork/whatseek-pc-chat';
import { appsI18nResources, createMockAppsClient } from '@sdkwork/whatseek-pc-apps';
import { contactsI18nResources, createMockContactsClient } from '@sdkwork/whatseek-pc-contacts';
import { messagesI18nResources, createMockMessagesClient } from '@sdkwork/whatseek-pc-messages';
import { profileI18nResources } from '@sdkwork/whatseek-pc-profile';

let booted = false;

export function bootTestRuntime(): void {
  if (booted) {
    return;
  }
  booted = true;
  createWhatseekI18n(
    mergeWhatseekResources(
      commonsI18nResources,
      shellI18nResources,
      chatI18nResources,
      appsI18nResources,
      contactsI18nResources,
      messagesI18nResources,
      profileI18nResources,
    ),
    'zh-CN',
  );
}

export function registerFreshMockClients(): void {
  resetWhatseekClients();
  const apps = createMockAppsClient({ storage: null });
  const contacts = createMockContactsClient();
  const messages = createMockMessagesClient({ storage: null, autoReplyMs: 20 });
  const tasks = createMockTasksClient({ storage: null });
  const chat = createMockChatClient(
    { apps, contacts, messages, tasks },
    { replyDelayMs: 0, taskStepMs: 0, scheduler: (callback) => { callback(); return () => undefined; }, storage: null },
  );
  registerWhatseekClient('apps', apps);
  registerWhatseekClient('contacts', contacts);
  registerWhatseekClient('messages', messages);
  registerWhatseekClient('tasks', tasks);
  registerWhatseekClient('chat', chat);
}
