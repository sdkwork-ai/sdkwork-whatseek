/**
 * Runtime bootstrap — the esbuild entry bundled into `src/runtime/app.js`
 * (scripts/build-runtime.mjs). Native pages consume the exported `appApi`
 * through CommonJS `require`; no page imports TypeScript sources directly.
 */

import {
  bindMiniProgramHost,
  bindRuntimeConfig,
  bootstrapMiniProgramClients,
  type MiniProgramRuntimeConfig,
} from '@sdkwork/whatseek-mp-core';
import { PAGE_TITLES, TAB_LABELS, TAB_PAGE_PATHS } from '@sdkwork/whatseek-mp-shell';

declare const __SDKWORK_RUNTIME_ENV__: MiniProgramRuntimeConfig;

export interface PageApi {
  chat: {
    send(text: string): Promise<{ replyText: string; cards: unknown; taskId?: string }>;
    runAction(action: unknown): Promise<string>;
  };
  apps: {
    search(query: string): Promise<unknown[]>;
    recommended(): Promise<unknown[]>;
    categories(): Promise<unknown[]>;
    detail(appId: string): Promise<unknown>;
    myApps(): Promise<unknown[]>;
    generate(requirement: string): Promise<unknown>;
    publish(appId: string): Promise<unknown>;
  };
  contacts: {
    search(query: string): Promise<unknown[]>;
    detail(contactId: string): Promise<unknown>;
  };
  messages: {
    conversations(): Promise<unknown[]>;
    thread(conversationId: string): Promise<unknown[]>;
    send(conversationId: string, content: string): Promise<unknown>;
    markRead(conversationId: string): Promise<void>;
    unread(): Promise<number>;
  };
  profile: {
    summary(): Promise<unknown>;
  };
  shell: {
    tabs: readonly string[];
    labels: Record<string, string>;
    titles: Record<string, string>;
  };
}

/**
 * Bind the typed host adapter around the WeChat globals. This is the only
 * module in the surface that touches `wx.*` (MINI_PROGRAM_APP_ARCHITECTURE_SPEC
 * §Host adapters).
 */
function bindWxHost(): void {
  bindMiniProgramHost({
    navigateTo(url) {
      wx.navigateTo({ url });
    },
    switchTab(url) {
      wx.switchTab({ url });
    },
    showToast(title) {
      wx.showToast({ title, icon: 'none' });
    },
  });
}

export function bootstrapRuntime(): PageApi {
  bindRuntimeConfig(__SDKWORK_RUNTIME_ENV__);
  bindWxHost();
  bootstrapMiniProgramClients();
  // Lazy requires keep page bundles decoupled from the chat capability until
  // first use; esbuild inlines them into the single CJS runtime bundle.
  /* eslint-disable @typescript-eslint/no-require-imports */
  const chat = require('@sdkwork/whatseek-mp-chat') as typeof import('@sdkwork/whatseek-mp-chat');
  const apps = require('@sdkwork/whatseek-mp-apps') as typeof import('@sdkwork/whatseek-mp-apps');
  const contacts = require('@sdkwork/whatseek-mp-contacts') as typeof import('@sdkwork/whatseek-mp-contacts');
  const messages = require('@sdkwork/whatseek-mp-messages') as typeof import('@sdkwork/whatseek-mp-messages');
  const profile = require('@sdkwork/whatseek-mp-profile') as typeof import('@sdkwork/whatseek-mp-profile');
  /* eslint-enable @typescript-eslint/no-require-imports */

  return {
    chat: {
      async send(text) {
        return chat.sendChatTurn(text);
      },
      async runAction(action) {
        return chat.runCardAction(action as Parameters<typeof chat.runCardAction>[0]);
      },
    },
    apps: {
      search: (query) => apps.searchApps(query),
      recommended: () => apps.listRecommended(),
      categories: () => apps.listCategories(),
      detail: (appId) => apps.getApp(appId),
      myApps: () => apps.listMyApps(),
      generate: (requirement) => apps.generateApp(requirement),
      publish: (appId) => apps.publishApp(appId),
    },
    contacts: {
      search: (query) => contacts.searchContacts(query),
      detail: (contactId) => contacts.getContact(contactId),
    },
    messages: {
      conversations: () => messages.listConversations(),
      thread: (conversationId) => messages.listMessages(conversationId),
      send: (conversationId, content) => messages.sendMessage(conversationId, content),
      markRead: (conversationId) => messages.markRead(conversationId),
      unread: () => messages.unreadTotal(),
    },
    profile: {
      summary: () => profile.loadProfileSummary(),
    },
    shell: {
      tabs: TAB_PAGE_PATHS,
      labels: { ...TAB_LABELS },
      titles: { ...PAGE_TITLES },
    },
  };
}

const appApi: PageApi = bootstrapRuntime();

export { appApi };
