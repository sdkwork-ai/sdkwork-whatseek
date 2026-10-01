/**
 * App bootstrap: runtime environment + SDK client registration (APP_H5
 * §2 `src/bootstrap/*`). All ports are registered here exactly once — mock
 * clients in Phase 1, generated SDK clients in Phase 2.
 */

import { createMockAppsClient } from '@sdkwork/whatseek-h5-apps';
import { createMockChatClient, createMockTasksClient } from '@sdkwork/whatseek-h5-chat';
import { createMockContactsClient } from '@sdkwork/whatseek-h5-contacts';
import { createMockMessagesClient } from '@sdkwork/whatseek-h5-messages';
import { registerWhatseekClient } from '@sdkwork/whatseek-h5-core';

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
