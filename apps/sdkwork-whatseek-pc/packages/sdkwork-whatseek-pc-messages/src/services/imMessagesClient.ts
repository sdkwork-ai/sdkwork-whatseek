/**
 * IM-backed `MessagesPort` over the sdkwork-im composed consumer package
 * `@sdkwork/im-sdk` (`/im/v3/api` + CCP realtime; APP_SDK_INTEGRATION_SPEC.md
 * §9 consumer import naming).
 *
 * The composed SDK client is constructed exactly once at app bootstrap
 * (`src/bootstrap/sdkClients.ts`, APP_SDK_INTEGRATION_SPEC.md §1) and injected
 * here through the narrow `ImMessagesGateway` slice. This module only maps IM
 * contracts onto the whatseek `MessagesPort`; it never constructs transports,
 * tokens, or HTTP on its own.
 *
 * Wire notes: int64 values (`messageSeq`, `lastMessageSeq`, `highWatermark`)
 * stay decimal strings per API_SPEC §13.6; the SDK auto-unwraps the
 * `{ code, data, traceId }` envelope, so this boundary sees bare payloads.
 */

import type {
  ConversationInboxEntry,
  ConversationMessageEntry,
  ImConnectOptions,
  ImDecodedMessage,
  ImLiveConnection,
  ImMessageContext,
  ImSdkClient,
} from '@sdkwork/im-sdk';

import type {
  ChatMessage,
  Conversation,
  ConversationKind,
  MessagesPort,
  MessagesPortEvents,
  WhatseekTask,
} from '@sdkwork/whatseek-service-core';

/** Narrow slice of `ImSdkClient` this adapter actually consumes. */
export interface ImMessagesGateway {
  conversations: Pick<
    ImSdkClient['conversations'],
    | 'create'
    | 'createSystemChannel'
    | 'getSummary'
    | 'list'
    | 'listMessages'
    | 'postText'
    | 'updatePreferences'
    | 'updateReadCursor'
  >;
  connect(options: ImConnectOptions): Promise<ImLiveConnection>;
}

export interface ImMessagesClientOptions {
  /** Injected composed IM client slice (constructed at app bootstrap). */
  gateway: ImMessagesGateway;
  /** Current session principal id — self-message detection + IM actor identity. */
  currentUserId: () => string;
  now?: () => Date;
  /** Open the CCP realtime connection after the first inbox refresh (default true). */
  realtime?: boolean;
}

const SELF_SENDER_ID = 'me';

function mapConversationKind(imType: string): ConversationKind {
  if (imType === 'direct') {
    return 'direct';
  }
  if (imType === 'group') {
    return 'group';
  }
  return 'system';
}

function messageContent(body: { text?: string | null; summary?: string | null }, fallback?: string | null): string {
  return body.text ?? body.summary ?? fallback ?? '';
}

function newClientMsgId(): string {
  const cryptoRef = globalThis.crypto;
  if (typeof cryptoRef?.randomUUID === 'function') {
    return cryptoRef.randomUUID();
  }
  return `whatseek-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createImMessagesClient(options: ImMessagesClientOptions): MessagesPort {
  const { gateway, currentUserId } = options;
  const now = options.now ?? (() => new Date());
  const realtimeEnabled = options.realtime !== false;

  let inbox: readonly ConversationInboxEntry[] = [];
  const taskChannelIds = new Set<string>();

  const listeners = new Set<(conversationId: string) => void>();
  const events: MessagesPortEvents = {
    onConversationChanged(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
  const emitChanged = (conversationId: string): void => {
    for (const listener of listeners) {
      listener(conversationId);
    }
  };

  let connection: ImLiveConnection | null = null;
  let connecting = false;
  const subscriptions = new Map<string, () => void>();
  const subscribeConnection = (live: ImLiveConnection): void => {
    const ids = new Set(inbox.map((entry) => entry.conversationId));
    for (const [conversationId, unsubscribe] of subscriptions) {
      if (!ids.has(conversationId)) {
        unsubscribe();
        subscriptions.delete(conversationId);
      }
    }
    for (const conversationId of ids) {
      if (subscriptions.has(conversationId)) {
        continue;
      }
      subscriptions.set(
        conversationId,
        live.messages.onConversation(
          conversationId,
          (_message: ImDecodedMessage, context: ImMessageContext) => {
            void context.ack().catch(() => undefined);
            emitChanged(conversationId);
          },
        ),
      );
    }
    live.subscriptions.syncConversations([...ids]);
  };
  const ensureRealtime = (): void => {
    if (!realtimeEnabled || connecting || connection !== null) {
      return;
    }
    connecting = true;
    gateway
      .connect({})
      .then((live) => {
        connection = live;
        connecting = false;
        live.lifecycle.onStateChange((state) => {
          // A closed socket falls back to pull mode; the next inbox refresh
          // retries the connection. Production reconnect coalescing is the
          // appbase session-recovery coordinator's job (IAM_LOGIN_INTEGRATION
          // SPEC §5.2) and lands with the Phase-2 IAM runtime.
          if (state.status === 'closed' || state.status === 'error') {
            connection = null;
          }
        });
        subscribeConnection(live);
      })
      .catch(() => {
        connecting = false;
      });
  };

  const refreshInbox = async (): Promise<readonly ConversationInboxEntry[]> => {
    const page = await gateway.conversations.list();
    inbox = page.items;
    ensureRealtime();
    if (connection !== null) {
      subscribeConnection(connection);
    }
    return inbox;
  };

  const inboxEntry = async (conversationId: string): Promise<ConversationInboxEntry | null> => {
    const cached = inbox.find((entry) => entry.conversationId === conversationId);
    if (cached !== undefined) {
      return cached;
    }
    const entries = await refreshInbox();
    return entries.find((entry) => entry.conversationId === conversationId) ?? null;
  };

  const mapInboxEntry = (entry: ConversationInboxEntry): Conversation => ({
    id: entry.conversationId,
    kind: mapConversationKind(entry.conversationType),
    ...(entry.displayName ? { title: entry.displayName } : {}),
    unread: entry.unreadCount,
    updatedAt: entry.lastActivityAt,
    ...(entry.lastSummary ? { lastMessagePreview: entry.lastSummary } : {}),
  });

  const mapMessage = (entry: ConversationMessageEntry): ChatMessage => ({
    id: entry.messageId,
    conversationId: entry.conversationId,
    senderId: entry.sender.id === currentUserId() ? SELF_SENDER_ID : entry.sender.id,
    senderName: entry.sender.displayName ?? entry.sender.id,
    content: messageContent(entry.body, entry.summary),
    sentAt: entry.occurredAt,
    kind: entry.messageType === 'system' ? 'system' : 'text',
  });

  return {
    events,
    async listConversations(): Promise<Conversation[]> {
      const entries = await refreshInbox();
      return entries.map(mapInboxEntry);
    },

    async listMessages(conversationId: string): Promise<ChatMessage[]> {
      const page = await gateway.conversations.listMessages(conversationId);
      return page.items.map(mapMessage);
    },

    async sendMessage(conversationId: string, content: string): Promise<ChatMessage> {
      const result = await gateway.conversations.postText(conversationId, content, {
        clientMsgId: newClientMsgId(),
      });
      emitChanged(conversationId);
      return {
        id: result.messageId,
        conversationId,
        senderId: SELF_SENDER_ID,
        senderName: SELF_SENDER_ID,
        content,
        sentAt: now().toISOString(),
        kind: 'text',
      };
    },

    async markRead(conversationId: string): Promise<void> {
      const entry = await inboxEntry(conversationId);
      const readSeq = entry?.lastMessageSeq ?? '0';
      // messageSeq is an int64 decimal string (API_SPEC §13.6); the read
      // cursor accepts the same shape.
      if (!/^\d+$/u.test(readSeq)) {
        throw new RangeError('Conversation read sequence must be a non-negative decimal integer string.');
      }
      await gateway.conversations.updateReadCursor(conversationId, { readSeq });
      await gateway.conversations.updatePreferences(conversationId, { isMarkedUnread: false });
      emitChanged(conversationId);
    },

    async openDirectConversation(contactId: string): Promise<Conversation> {
      // Idempotent by clientRequestKey; conversationType/memberUserIds are the
      // app-api direct-conversation shape.
      const result = await gateway.conversations.create({
        conversationType: 'direct',
        memberUserIds: [contactId],
        clientRequestKey: `whatseek-direct-${contactId}`,
      });
      const summary = await gateway.conversations.getSummary(result.conversationId);
      emitChanged(result.conversationId);
      return {
        id: result.conversationId,
        kind: 'direct',
        unread: 0,
        updatedAt: summary.lastMessageAt ?? now().toISOString(),
        ...(summary.lastSummary ? { lastMessagePreview: summary.lastSummary } : {}),
      };
    },

    async postTaskNotification(task: WhatseekTask): Promise<void> {
      // WhatSeek task notices ride a per-task IM system channel; the
      // client-supplied conversationId keeps channel creation idempotent.
      const conversationId = `whatseek-task-${task.id}`;
      if (!taskChannelIds.has(conversationId)) {
        await gateway.conversations.createSystemChannel({
          conversationId,
          subscriberId: currentUserId(),
        });
        taskChannelIds.add(conversationId);
      }
      await gateway.conversations.postText(conversationId, task.resultSummary ?? task.title, {
        clientMsgId: newClientMsgId(),
      });
      emitChanged(conversationId);
    },

    async getUnreadTotal(): Promise<number> {
      const entries = await refreshInbox();
      return entries.reduce((total, entry) => total + entry.unreadCount, 0);
    },
  };
}
