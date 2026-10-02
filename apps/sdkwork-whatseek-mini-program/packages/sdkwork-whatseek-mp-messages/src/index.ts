/**
 * Public export boundary of `@sdkwork/whatseek-mp-messages` — conversation
 * view models for the native pages (list, thread, unread).
 */

import type { ChatMessage, Conversation, MessagesPort } from '@sdkwork/whatseek-service-core';
import { getWhatseekClient } from '@sdkwork/whatseek-service-core';

export type { ChatMessage, Conversation };

export function messagesPort(): MessagesPort {
  return getWhatseekClient('messages');
}

export async function listConversations(): Promise<Conversation[]> {
  return messagesPort().listConversations();
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
