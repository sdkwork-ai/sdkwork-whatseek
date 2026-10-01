/**
 * App bootstrap: runtime environment + SDK client registration (APP_H5
 * §2 `src/bootstrap/*`). All ports are registered here exactly once — mock
 * clients in Phase 1, generated SDK clients in Phase 2.
 */

import { createMockAppsClient } from '@sdkwork/whatseek-pc-apps';
import { createMockChatClient, createMockTasksClient } from '@sdkwork/whatseek-pc-chat';
import { createMockContactsClient } from '@sdkwork/whatseek-pc-contacts';
import { createMockMessagesClient } from '@sdkwork/whatseek-pc-messages';
import { registerWhatseekClient } from '@sdkwork/whatseek-pc-core';

export function bootstrapSdkClients(): void {
  const apps = createMockAppsClient();
  const contacts = createMockContactsClient();
  const messages = createMockMessagesClient();
  const tasks = createMockTasksClient();
  const chat = createMockChatClient({ apps, contacts, messages, tasks });

  registerWhatseekClient('apps', apps);
  registerWhatseekClient('contacts', contacts);
  registerWhatseekClient('messages', messages);
  registerWhatseekClient('tasks', tasks);
  registerWhatseekClient('chat', chat);
}
