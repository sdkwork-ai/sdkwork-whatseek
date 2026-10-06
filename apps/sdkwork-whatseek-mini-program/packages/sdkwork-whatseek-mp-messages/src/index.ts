/**
 * Public export boundary of `@sdkwork/whatseek-mp-messages` — conversation
 * view models for the native pages (list, thread, unread). titleKey'd
 * conversations (system/app/task) resolve to localized titles here so page
 * layers can render `title` directly.
 */

import type { ChatMessage, Conversation, MessagesPort } from '@sdkwork/whatseek-service-core';
import { getWhatseekClient } from '@sdkwork/whatseek-service-core';

import enStrings from './i18n/en-US/whatseek/messages/strings.json';
import zhStrings from './i18n/zh-CN/whatseek/messages/strings.json';

export type { ChatMessage, Conversation };

type Locale = 'zh-CN' | 'en-US';

const KIND_TITLES: Record<string, Record<Locale, string>> = {
  'whatseek.messages.kind.system': { 'zh-CN': zhStrings.kind.system, 'en-US': enStrings.kind.system },
  'whatseek.messages.kind.app': { 'zh-CN': zhStrings.kind.app, 'en-US': enStrings.kind.app },
  'whatseek.messages.kind.task': { 'zh-CN': zhStrings.kind.task, 'en-US': enStrings.kind.task },
};

let locale: Locale = 'zh-CN';

export function setMessagesLocale(next: Locale): void {
  locale = next;
}

function withResolvedTitle(conversation: Conversation): Conversation {
  const titleKey = conversation.titleKey;
  if (conversation.title !== undefined || titleKey === undefined) {
    return conversation;
  }
  const title = KIND_TITLES[titleKey]?.[locale] ?? titleKey;
  return { ...conversation, title };
}

export function messagesPort(): MessagesPort {
  return getWhatseekClient('messages');
}

export async function listConversations(): Promise<Conversation[]> {
  const conversations = await messagesPort().listConversations();
  return conversations.map(withResolvedTitle);
}

export async function listMessages(conversationId: string): Promise<ChatMessage[]> {
  return messagesPort().listMessages(conversationId);
}

export async function sendMessage(conversationId: string, content: string): Promise<ChatMessage> {
  return messagesPort().sendMessage(conversationId, content);
}

export async function markRead(conversationId: string): Promise<void> {
  await messagesPort().markRead(conversationId);
}

export async function unreadTotal(): Promise<number> {
  return messagesPort().getUnreadTotal();
}

export async function openDirectConversation(contactId: string): Promise<Conversation> {
  return messagesPort().openDirectConversation(contactId);
}

export {
  createImMessagesClient,
  type ImMessagesClientOptions,
  type ImMessagesGateway,
} from './services/imMessagesClient.js';
