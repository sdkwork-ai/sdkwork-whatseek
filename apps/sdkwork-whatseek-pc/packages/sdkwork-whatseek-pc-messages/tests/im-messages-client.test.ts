import { afterEach, describe, expect, it, vi } from 'vitest';

import type {
  ConversationInboxEntry,
  ConversationMessageEntry,
} from '@sdkwork/im-sdk';

import { createImMessagesClient } from '../src/services/imMessagesClient.js';
import type { ImMessagesGateway } from '../src/services/imMessagesClient.js';
import type { WhatseekTask } from '@sdkwork/whatseek-service-core';

function inboxEntry(overrides: Partial<ConversationInboxEntry> = {}): ConversationInboxEntry {
  return {
    tenantId: 't1',
    conversationId: 'conv-1',
    conversationType: 'direct',
    displayName: '张三',
    lastActivityAt: '2026-10-03T08:00:00Z',
    lastMessageSeq: '42',
    messageCount: 3,
    unreadCount: 2,
    ...overrides,
  };
}

function messageEntry(overrides: Partial<ConversationMessageEntry> = {}): ConversationMessageEntry {
  return {
    tenantId: 't1',
    conversationId: 'conv-1',
    messageId: 'm-1',
    messageSeq: '42',
    sender: { id: 'zhangsan', kind: 'user', displayName: '张三' },
    body: { parts: [], text: '下午三点开会' },
    messageType: 'standard',
    deliveryMode: 'persistent',
    occurredAt: '2026-10-03T07:59:00Z',
    ...overrides,
  };
}

interface FakeGateway extends ImMessagesGateway {
  emitMessage(message: ConversationMessageEntry): void;
  connectCalls(): number;
}

function createFakeGateway(items: ConversationInboxEntry[] = []): FakeGateway {
  const conversations = {
    list: vi.fn(async () => ({ items, pageInfo: { mode: 'cursor' as const } })),
    listMessages: vi.fn(async () => ({
      items: [messageEntry()],
      pageInfo: { mode: 'cursor' as const },
      highWatermark: '42',
    })),
    postText: vi.fn(async (_conversationId: string, _text: string) => ({
      messageId: 'm-new',
      messageSeq: '43',
      eventId: 'e-1',
      deliveryStatus: 'applied' as const,
    })),
    updateReadCursor: vi.fn(async () => ({
      tenantId: 't1',
      conversationId: 'conv-1',
      principalId: 'zhangsan',
      readSeq: '42',
      updatedAt: '2026-10-03T08:01:00Z',
    })),
    updatePreferences: vi.fn(async () => ({
      tenantId: 't1',
      conversationId: 'conv-1',
      principalKind: 'user',
      principalId: 'zhangsan',
      isPinned: false,
      isMuted: false,
      isMarkedUnread: false,
      isHidden: false,
      updatedAt: '2026-10-03T08:01:00Z',
    })),
    create: vi.fn(async () => ({
      conversationId: 'conv-direct-9',
      eventId: 'e-2',
      deliveryStatus: 'applied' as const,
    })),
    getSummary: vi.fn(async () => ({
      tenantId: 't1',
      conversationId: 'conv-direct-9',
      messageCount: 0,
      lastMessageSeq: '0',
    })),
    createSystemChannel: vi.fn(async () => ({
      conversationId: 'whatseek-task-task-x',
      eventId: 'e-3',
      deliveryStatus: 'applied' as const,
    })),
  };
  let handlers = new Map<string, (message: ConversationMessageEntry, context: { ack(): Promise<void> }) => void>();
  let connectCount = 0;
  const gateway: FakeGateway = {
    conversations,
    connect: vi.fn(async () => {
      connectCount += 1;
      handlers = new Map();
      return {
        disconnect: vi.fn(),
        messages: {
          onConversation: vi.fn(
            (
              conversationId: string,
              handler: (message: ConversationMessageEntry, context: { ack(): Promise<void> }) => void,
            ) => {
              handlers.set(conversationId, handler);
              return () => {
                handlers.delete(conversationId);
              };
            },
          ),
        },
        events: {
          onConversation: vi.fn(() => () => undefined),
          onScope: vi.fn(() => () => undefined),
        },
        lifecycle: {
          onError: vi.fn(() => () => undefined),
          onStateChange: vi.fn(() => () => undefined),
        },
        subscriptions: {
          syncConversations: vi.fn(),
          syncScopes: vi.fn(),
        },
      } as unknown as Awaited<ReturnType<FakeGateway['connect']>>;
    }),
    emitMessage(message: ConversationMessageEntry): void {
      handlers.get(message.conversationId)?.(message, { ack: async () => undefined });
    },
    connectCalls(): number {
      return connectCount;
    },
  };
  return gateway;
}

function createClient(gateway: FakeGateway, currentUserId: () => string = () => 'zhangsan') {
  return createImMessagesClient({ gateway, currentUserId, realtime: false });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('im messages client (sdkwork-im adapter)', () => {
  it('maps_inbox_entries_onto_the_whatseek_conversation_shape', async () => {
    const gateway = createFakeGateway([
      inboxEntry(),
      inboxEntry({ conversationId: 'conv-g', conversationType: 'group', displayName: null, unreadCount: 0, lastSummary: null }),
      inboxEntry({ conversationId: 'conv-s', conversationType: 'broadcast' }),
    ]);
    const client = createClient(gateway);

    const conversations = await client.listConversations();
    expect(conversations).toEqual([
      { id: 'conv-1', kind: 'direct', title: '张三', unread: 2, updatedAt: '2026-10-03T08:00:00Z' },
      { id: 'conv-g', kind: 'group', unread: 0, updatedAt: '2026-10-03T08:00:00Z' },
      { id: 'conv-s', kind: 'system', title: '张三', unread: 2, updatedAt: '2026-10-03T08:00:00Z' },
    ]);
  });

  it('maps_messages_and_marks_self_messages_by_session_user_id', async () => {
    const gateway = createFakeGateway();
    gateway.conversations.listMessages = vi.fn(async () => ({
      items: [
        messageEntry(),
        messageEntry({
          messageId: 'm-2',
          messageSeq: '43',
          sender: { id: 'zhangsan', kind: 'user', displayName: null },
          body: { parts: [], text: null, summary: '文本为空走摘要' },
          messageType: 'system',
        }),
      ],
      pageInfo: { mode: 'cursor' as const },
      highWatermark: '43',
    }));
    const client = createClient(gateway);

    const messages = await client.listMessages('conv-1');
    expect(messages[0]).toMatchObject({ id: 'm-1', senderId: 'me', senderName: '张三', content: '下午三点开会', kind: 'text' });
    expect(messages[1]).toMatchObject({ id: 'm-2', senderId: 'me', senderName: 'zhangsan', content: '文本为空走摘要', kind: 'system' });
  });

  it('sends_via_postText_with_a_client_msg_id_and_echoes_the_sent_shape', async () => {
    const gateway = createFakeGateway();
    const client = createClient(gateway);

    const sent = await client.sendMessage('conv-1', '好的，准时到。');
    expect(gateway.conversations.postText).toHaveBeenCalledWith('conv-1', '好的，准时到。', { clientMsgId: expect.any(String) });
    expect(sent).toMatchObject({ id: 'm-new', conversationId: 'conv-1', senderId: 'me', content: '好的，准时到。', kind: 'text' });
  });

  it('marks_read_through_the_read_cursor_and_preferences', async () => {
    const gateway = createFakeGateway([inboxEntry()]);
    const client = createClient(gateway);
    // Warm the inbox cache so markRead resolves the last message seq.
    await client.listConversations();

    await client.markRead('conv-1');
    expect(gateway.conversations.updateReadCursor).toHaveBeenCalledWith('conv-1', { readSeq: '42' });
    expect(gateway.conversations.updatePreferences).toHaveBeenCalledWith('conv-1', { isMarkedUnread: false });
  });

  it('marks_read_on_an_uncached_conversation_by_refreshing_the_inbox', async () => {
    const gateway = createFakeGateway([inboxEntry()]);
    const client = createClient(gateway);

    await client.markRead('conv-1');
    expect(gateway.conversations.updateReadCursor).toHaveBeenCalledWith('conv-1', { readSeq: '42' });
  });

  it('sums_unread_counts_from_the_inbox', async () => {
    const gateway = createFakeGateway([inboxEntry(), inboxEntry({ conversationId: 'conv-2', unreadCount: 5 })]);
    const client = createClient(gateway);

    expect(await client.getUnreadTotal()).toBe(7);
  });

  it('opens_direct_conversations_idempotently_by_client_request_key', async () => {
    const gateway = createFakeGateway();
    const client = createClient(gateway);

    const conversation = await client.openDirectConversation('lisi');
    expect(gateway.conversations.create).toHaveBeenCalledWith({
      conversationType: 'direct',
      memberUserIds: ['lisi'],
      clientRequestKey: 'whatseek-direct-lisi',
    });
    expect(conversation).toMatchObject({ id: 'conv-direct-9', kind: 'direct', unread: 0 });
  });

  it('posts_task_notifications_through_an_idempotent_per_task_system_channel', async () => {
    const gateway = createFakeGateway();
    const client = createClient(gateway);
    const task: WhatseekTask = {
      id: 'task-x',
      title: '生成视频',
      intent: 'CREATE_CONTENT',
      state: 'completed',
      createdAt: '2026-10-03T08:00:00Z',
      updatedAt: '2026-10-03T08:05:00Z',
      resultSummary: '视频已生成',
    };

    await client.postTaskNotification(task);
    await client.postTaskNotification(task);
    expect(gateway.conversations.createSystemChannel).toHaveBeenCalledTimes(1);
    expect(gateway.conversations.createSystemChannel).toHaveBeenCalledWith({
      conversationId: 'whatseek-task-task-x',
      subscriberId: 'zhangsan',
    });
    expect(gateway.conversations.postText).toHaveBeenCalledWith(
      'whatseek-task-task-x',
      '视频已生成',
      { clientMsgId: expect.any(String) },
    );
  });

  it('pushes_realtime_conversation_activity_through_the_events_surface', async () => {
    const gateway = createFakeGateway([inboxEntry()]);
    const client = createImMessagesClient({ gateway, currentUserId: () => 'zhangsan' });

    const changed: string[] = [];
    const unsubscribe = client.events?.onConversationChanged((id) => changed.push(id));

    await client.listConversations();
    // Realtime connects after the first inbox refresh and subscribes to the inbox.
    await vi.waitFor(() => expect(gateway.connectCalls()).toBe(1));
    expect(gateway.connect).toHaveBeenCalledWith({});

    gateway.emitMessage(
      messageEntry({ conversationId: 'conv-1', messageId: 'm-live', messageSeq: '44' }),
    );
    expect(changed).toEqual(['conv-1']);

    unsubscribe?.();
    gateway.emitMessage(
      messageEntry({ conversationId: 'conv-1', messageId: 'm-live-2', messageSeq: '45' }),
    );
    expect(changed).toEqual(['conv-1']);
  });

  it('stays_pull_based_when_realtime_is_disabled', async () => {
    const gateway = createFakeGateway([inboxEntry()]);
    const client = createImMessagesClient({ gateway, currentUserId: () => 'zhangsan', realtime: false });

    await client.listConversations();
    expect(gateway.connectCalls()).toBe(0);
    expect(client.events?.onConversationChanged(() => undefined)).toBeTypeOf('function');
  });
});
