/**
 * SDK client ports (APP_H5_ARCHITECTURE_SPEC.md §1, FRONTEND_CODE_SPEC.md §2).
 *
 * Capability packages implement these ports and register the implementations
 * at app bootstrap (`src/bootstrap/sdkClients.ts`); consumers depend only on
 * the interfaces. UI components never construct clients directly.
 */

import type {
  AppCategory,
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
  draftCreationPlan(requirement: string): { title: string; modules: string[] };
  createAppFromPlan(requirement: string, modules: readonly string[]): Promise<CreatedApp>;
  modifyApp(appId: string, instruction: string): Promise<CreatedApp>;
  publishApp(appId: string): Promise<CreatedApp>;
}

export interface ContactsPort {
  listContacts(): Promise<Contact[]>;
  searchContacts(query: string): Promise<Contact[]>;
  getContact(contactId: string): Promise<Contact | null>;
}

export interface MessagesPort {
  listConversations(): Promise<Conversation[]>;
  listMessages(conversationId: string): Promise<ChatMessage[]>;
  sendMessage(conversationId: string, content: string): Promise<ChatMessage>;
  markRead(conversationId: string): Promise<void>;
  openDirectConversation(contactId: string): Promise<Conversation>;
  postTaskNotification(task: WhatseekTask): Promise<void>;
  getUnreadTotal(): Promise<number>;
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
