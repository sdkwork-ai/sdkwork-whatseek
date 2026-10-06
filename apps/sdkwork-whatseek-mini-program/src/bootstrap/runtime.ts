/**
 * Runtime bootstrap — the esbuild entry bundled into `src/runtime/app.js`
 * (scripts/build-runtime.mjs). Native pages consume the exported `appApi`
 * through CommonJS `require`; no page imports TypeScript sources directly.
 *
 * sdkwork-im driver (messages + contacts capabilities): when the runtime
 * config declares an IM API base URL (`sdkworkImApiBaseUrl` from
 * config/mini-program runtime-env sources), the wx.request-backed fetch
 * polyfill and wx.connectSocket-backed realtime factory are installed here and
 * one composed `@sdkwork/im-sdk` client is constructed with one session
 * TokenManager; the IM-backed ports then override the mock registrations.
 * Empty (standalone milestone default) keeps every port on the mock clients.
 */

import { createTokenManager } from '@sdkwork/sdk-common';
import { ImSdkClient, type ImSdkClientOptions } from '@sdkwork/im-sdk';
import {
  bindMiniProgramHost,
  bindRuntimeConfig,
  bootstrapMiniProgramClients,
  createMiniProgramWebSocketFactory,
  getMiniProgramHost,
  installMiniProgramFetchPolyfill,
  type MiniProgramRequestPort,
  type MiniProgramRuntimeConfig,
  type MiniProgramWebSocketPort,
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
    modify(appId: string, instruction: string): Promise<CreatedAppView>;
    deleteMyApp(appId: string): Promise<void>;
    favorites(): Promise<unknown[]>;
    toggleFavorite(appId: string): Promise<boolean>;
    recents(): Promise<unknown[]>;
    hot(): Promise<unknown[]>;
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
    /** Current mock session (visitor auto-exists, H5/PC parity). */
    getSession(): { id: string; name: string; avatar: string; isVisitor: boolean };
    signIn(name?: string): { id: string; name: string; avatar: string; isVisitor: boolean };
    signOut(): { id: string; name: string; avatar: string; isVisitor: boolean };
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
 * §Host adapters). The typed request port additionally feeds the sdkwork-im
 * fetch polyfill, which must be installed before any IM request runs.
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
  installMiniProgramFetchPolyfill(wx as unknown as MiniProgramRequestPort);
}

/**
 * Construct the composed IM client for the resolved runtime config, or `null`
 * when no IM gateway is declared (mock-driver standalone milestone).
 */
function createMiniProgramImSdkClient(env: MiniProgramRuntimeConfig): ImSdkClient | null {
  const apiBaseUrl = env.sdkworkImApiBaseUrl?.trim() ?? '';
  if (apiBaseUrl.length === 0) {
    return null;
  }
  // TokenManager closure rule (APP_SDK_INTEGRATION_SPEC.md: one manager per
  // authenticated session context). Tokens are fed by the Phase-2 IAM runtime;
  // the standalone milestone starts empty and the driver only activates when
  // a gateway is actually mounted.
  const tokenManager = createTokenManager();
  const websocketBaseUrl = env.sdkworkImWebSocketBaseUrl?.trim() ?? '';
  const options: ImSdkClientOptions = {
    apiBaseUrl,
    ...(websocketBaseUrl.length > 0 ? { websocketBaseUrl } : {}),
    platform: 'mini-program',
    tokenManager,
    webSocketFactory: createMiniProgramWebSocketFactory(wx as unknown as MiniProgramWebSocketPort),
  };
  return new ImSdkClient(options);
}

export function bootstrapRuntime(): PageApi {
  bindRuntimeConfig(__SDKWORK_RUNTIME_ENV__);
  bindWxHost();
  // Capability modules first: the IM port overrides below come from the
  // messages/contacts packages and the session id from the profile package.
  /* eslint-disable @typescript-eslint/no-require-imports */
  const chat = require('@sdkwork/whatseek-mp-chat') as typeof import('@sdkwork/whatseek-mp-chat');
  const apps = require('@sdkwork/whatseek-mp-apps') as typeof import('@sdkwork/whatseek-mp-apps');
  const contacts = require('@sdkwork/whatseek-mp-contacts') as typeof import('@sdkwork/whatseek-mp-contacts');
  const messages = require('@sdkwork/whatseek-mp-messages') as typeof import('@sdkwork/whatseek-mp-messages');
  const profile = require('@sdkwork/whatseek-mp-profile') as typeof import('@sdkwork/whatseek-mp-profile');
  const commons = require('@sdkwork/whatseek-mp-commons') as typeof import('@sdkwork/whatseek-mp-commons');
  /* eslint-enable @typescript-eslint/no-require-imports */

  const im = createMiniProgramImSdkClient(__SDKWORK_RUNTIME_ENV__);
  bootstrapMiniProgramClients(
    im === null
      ? {}
      : {
          contacts: contacts.createImContactsClient({
            gateway: { contacts: im.social.contacts },
          }),
          messages: messages.createImMessagesClient({
            gateway: {
              conversations: im.conversations,
              connect: (options) => im.connect(options),
            },
            currentUserId: () => profile.getSessionUser().id,
          }),
        },
  );

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
      modify: (appId, instruction) => apps.modifyMyApp(appId, instruction),
      deleteMyApp: (appId) => apps.deleteMyApp(appId),
      favorites: () => apps.listFavoriteApps(),
      toggleFavorite: (appId) => apps.toggleFavoriteApp(appId),
      recents: () => apps.listRecentApps(),
      hot: () => apps.listHotApps(),
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
      getSession: () => profile.getSessionUser(),
      signIn: (name?: string) => profile.signIn(name),
      signOut: () => profile.signOut(),
      getAppearance: () => profile.getAppearanceSettings(),
      setAppearance: (next) => profile.setAppearanceSettings(next),
      setLocale: (locale) => {
        profile.setAppearanceSettings({ locale });
        chat.setChatLocale(locale);
        messages.setMessagesLocale(locale);
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
