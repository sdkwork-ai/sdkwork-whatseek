/**
 * SDK client ports (APP_H5_ARCHITECTURE_SPEC.md §1, FRONTEND_CODE_SPEC.md §2).
 *
 * Capability packages implement these ports and register the implementations
 * at app bootstrap (`src/bootstrap/sdkClients.ts`); consumers depend only on
 * the interfaces. UI components never construct clients directly.
 */

import type {
  AppCategory,
  AppChartId,
  AppHomeFeed,
  AppCollection,
  AppRecommendation,
  ChatMessage,
  ChatReply,
  Contact,
  Conversation,
  CreatedApp,
  WhatseekApp,
  WhatseekTask,
} from './types.js';

export interface AppsPort {
  searchApps(query: string): Promise<AppRecommendation[]>;
  /** Appstore-style home feed: heroes, stories, collections, chart previews. */
  listHomeFeed(): Promise<AppHomeFeed>;
  getCollection(collectionId: string): Promise<AppCollection | null>;
  listCollectionApps(collectionId: string): Promise<WhatseekApp[]>;
  listChart(chartId: AppChartId): Promise<WhatseekApp[]>;
  listRecommended(): Promise<WhatseekApp[]>;
  listHot(): Promise<WhatseekApp[]>;
  listCategories(): Promise<AppCategory[]>;
  listByCategory(categoryId: string): Promise<WhatseekApp[]>;
  getApp(appId: string): Promise<WhatseekApp | null>;
  listRecent(): Promise<WhatseekApp[]>;
  recordRecent(appId: string): Promise<void>;
  listFavorites(): Promise<WhatseekApp[]>;
  toggleFavorite(appId: string): Promise<boolean>;
  listMyApps(): Promise<CreatedApp[]>;
  getMyApp(appId: string): Promise<CreatedApp | null>;
  deleteMyApp(appId: string): Promise<void>;
  draftCreationPlan(requirement: string): { title: string; modules: string[]; pages: string[]; dataModel: string[] };
  createAppFromPlan(requirement: string, modules: readonly string[]): Promise<CreatedApp>;
  modifyApp(appId: string, instruction: string): Promise<CreatedApp>;
  publishApp(appId: string): Promise<CreatedApp>;
}

export interface ContactsPort {
  listContacts(): Promise<Contact[]>;
  searchContacts(query: string): Promise<Contact[]>;
  getContact(contactId: string): Promise<Contact | null>;
}

/**
 * Optional realtime surface of a messages implementation. Pull-based clients
 * (the Phase-1 mock) leave `events` undefined; realtime-backed clients (the
 * sdkwork-im adapter) push conversation activity so screens refresh live.
 */
export interface MessagesPortEvents {
  /**
   * Subscribe to conversation activity (new message, read-state or unread
   * change). Returns the unsubscribe function.
   */
  onConversationChanged(listener: (conversationId: string) => void): () => void;
}

export interface MessagesPort {
  listConversations(): Promise<Conversation[]>;
  listMessages(conversationId: string): Promise<ChatMessage[]>;
  sendMessage(conversationId: string, content: string): Promise<ChatMessage>;
  markRead(conversationId: string): Promise<void>;
  openDirectConversation(contactId: string): Promise<Conversation>;
  postTaskNotification(task: WhatseekTask): Promise<void>;
  getUnreadTotal(): Promise<number>;
  /** Present on realtime-backed implementations; `undefined` means pull-based. */
  readonly events?: MessagesPortEvents;
}

export interface TasksPort {
  createTask(input: { title: string; intent: string }): Promise<WhatseekTask>;
  updateTaskState(
    taskId: string,
    state: WhatseekTask['state'],
    resultSummary?: string,
  ): Promise<WhatseekTask>;
  getTask(taskId: string): Promise<WhatseekTask | null>;
  listTasks(): Promise<WhatseekTask[]>;
}

/** Serializable action dispatched by a rendered chat card. */
export type ChatCardAction =
  | { kind: 'use_app'; appId: string }
  | { kind: 'create_from_app'; appId: string }
  | { kind: 'generate_app'; requirement: string; modules: readonly string[] }
  | { kind: 'confirm_send_message'; contactId: string; contactName: string; draft: string }
  | { kind: 'open_contact'; contactId: string }
  | { kind: 'confirm_task'; taskId: string }
  | { kind: 'cancel_task'; taskId: string };

export interface ChatActionOutcome {
  /** i18n key describing the action result (`whatseek.chat.reply.action.*`). */
  message: string;
  messageParams?: Record<string, unknown>;
  createdAppId?: string;
  conversationId?: string;
  taskId?: string;
}

export interface ChatPort {
  /** Process one user turn; returns the AI reply (cards included). */
  handleSend(text: string): Promise<ChatReply>;
  /** Execute the primary action of a rendered card. */
  runCardAction(action: ChatCardAction): Promise<ChatActionOutcome>;
}

export type WhatseekPortMap = {
  apps: AppsPort;
  contacts: ContactsPort;
  messages: MessagesPort;
  tasks: TasksPort;
  chat: ChatPort;
};

export type WhatseekPortName = keyof WhatseekPortMap;
