/**
 * Runtime bootstrap — the esbuild entry bundled into `src/runtime/app.js`
 * (scripts/build-runtime.mjs). Native pages consume the exported `appApi`
 * through CommonJS `require`; no page imports TypeScript sources directly.
 */

import {
  bindMiniProgramHost,
  bindRuntimeConfig,
  bootstrapMiniProgramClients,
  getMiniProgramHost,
  type MiniProgramRuntimeConfig,
} from '@sdkwork/whatseek-mp-core';
import { PAGE_TITLES, TAB_LABELS, TAB_PAGE_PATHS } from '@sdkwork/whatseek-mp-shell';

declare const __SDKWORK_RUNTIME_ENV__: MiniProgramRuntimeConfig;

export interface CreatedAppView {
  id: string;
  name: string;
  requirement: string;
  modules: string[];
  lifecycle: string;
  icon: string;
}

export interface TaskView {
  id: string;
  title: string;
  state: string;
  resultSummary?: string;
}

export interface PageApi {
  chat: {
    send(text: string): Promise<{ replyText: string; cards: unknown; taskId?: string }>;
    runAction(action: unknown): Promise<string>;
    taskStatus(taskId: string): Promise<TaskView | null>;
  };
  apps: {
    search(query: string): Promise<unknown[]>;
    recommended(): Promise<unknown[]>;
    categories(): Promise<unknown[]>;
    detail(appId: string): Promise<unknown>;
    myApps(): Promise<unknown[]>;
    open(appId: string): Promise<void>;
    generate(requirement: string): Promise<unknown>;
    publish(appId: string): Promise<unknown>;
    draftPlan(requirement: string): { title: string; modules: string[] };
    createFromPlan(requirement: string, modules: readonly string[]): Promise<CreatedAppView>;
    deleteMyApp(appId: string): Promise<void>;
    favorites(): Promise<unknown[]>;
    toggleFavorite(appId: string): Promise<boolean>;
    recents(): Promise<unknown[]>;
    byCategory(categoryId: string): Promise<unknown[]>;
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
    openDirect(contactId: string): Promise<unknown>;
  };
  profile: {
    summary(): Promise<unknown>;
    getAppearance(): { colorMode: 'light' | 'dark'; locale: 'zh-CN' | 'en-US' };
    setAppearance(next: Partial<{ colorMode: 'light' | 'dark'; locale: 'zh-CN' | 'en-US' }>): {
      colorMode: 'light' | 'dark';
      locale: 'zh-CN' | 'en-US';
    };
    /** Persist the locale and switch the chat reply language in one call. */
    setLocale(locale: 'zh-CN' | 'en-US'): void;
  };
  shell: {
    tabs: readonly string[];
    labels: Record<string, string>;
    titles: Record<string, string>;
    toast(title: string): void;
    navigate(url: string): void;
    taskStateLabel(state: string): string;
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
  const commons = require('@sdkwork/whatseek-mp-commons') as typeof import('@sdkwork/whatseek-mp-commons');
  /* eslint-enable @typescript-eslint/no-require-imports */

  return {
    chat: {
      async send(text) {
        return chat.sendChatTurn(text);
      },
      async runAction(action) {
        return chat.runCardAction(action as Parameters<typeof chat.runCardAction>[0]);
      },
      taskStatus: (taskId) => chat.taskStatus(taskId),
    },
    apps: {
      search: (query) => apps.searchApps(query),
      recommended: () => apps.listRecommended(),
      categories: () => apps.listCategories(),
      detail: (appId) => apps.getApp(appId),
      myApps: () => apps.listMyApps(),
      open: (appId) => apps.openApp(appId),
      generate: (requirement) => apps.generateApp(requirement),
      publish: (appId) => apps.publishApp(appId),
      draftPlan: (requirement) => apps.draftCreationPlan(requirement),
      createFromPlan: (requirement, modules) => apps.createAppFromPlan(requirement, modules),
      deleteMyApp: (appId) => apps.deleteMyApp(appId),
      favorites: () => apps.listFavoriteApps(),
      toggleFavorite: (appId) => apps.toggleFavoriteApp(appId),
      recents: () => apps.listRecentApps(),
      byCategory: (categoryId) => apps.listAppsByCategory(categoryId),
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
      openDirect: (contactId) => messages.openDirectConversation(contactId),
    },
    profile: {
      summary: () => profile.loadProfileSummary(),
      getAppearance: () => profile.getAppearanceSettings(),
      setAppearance: (next) => profile.setAppearanceSettings(next),
      setLocale: (locale) => {
        profile.setAppearanceSettings({ locale });
        chat.setChatLocale(locale);
      },
    },
    shell: {
      tabs: TAB_PAGE_PATHS,
      labels: { ...TAB_LABELS },
      titles: { ...PAGE_TITLES },
      toast: (title) => getMiniProgramHost().showToast(title),
      navigate: (url) => getMiniProgramHost().navigateTo(url),
      taskStateLabel: (state) =>
        (commons.TASK_STATE_LABELS as Record<string, string>)[state] ?? state,
    },
  };
}

const appApi: PageApi = bootstrapRuntime();

export { appApi };
