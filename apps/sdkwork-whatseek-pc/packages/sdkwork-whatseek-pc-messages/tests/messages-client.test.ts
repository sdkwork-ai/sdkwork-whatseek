import { describe, expect, it } from 'vitest';

import { conversationKindGlyph, createMockMessagesClient } from '../src/services/messagesClient.js';
import type { WhatseekTask } from '@sdkwork/whatseek-pc-core';

describe('mock messages client (PRD §27/§42)', () => {
  it('seeds_conversations_across_kinds_and_counts_unread', async () => {
    const client = createMockMessagesClient({ storage: null });
    const conversations = await client.listConversations();
    const kinds = new Set(conversations.map((conversation) => conversation.kind));
    for (const kind of ['direct', 'group', 'system', 'agent', 'task']) {
      expect(kinds.has(kind as 'direct'), `missing kind ${kind}`).toBe(true);
    }
    expect(await client.getUnreadTotal()).toBeGreaterThan(0);
  });

  it('sends_a_message_and_marks_read', async () => {
    const client = createMockMessagesClient({ storage: null });
    const sent = await client.sendMessage('conv-zhangsan', '下午三点开会');
    expect(sent.content).toBe('下午三点开会');
    const thread = await client.listMessages('conv-zhangsan');
    expect(thread.some((message) => message.id === sent.id)).toBe(true);
    await client.markRead('conv-zhangsan');
    const conversations = await client.listConversations();
    expect(conversations.find((conversation) => conversation.id === 'conv-zhangsan')?.unread).toBe(0);
  });

  it('opens_direct_conversations_idempotently', async () => {
    const client = createMockMessagesClient({ storage: null });
    const first = await client.openDirectConversation('lisi');
    const second = await client.openDirectConversation('lisi');
    expect(second.id).toBe(first.id);
  });

  it('posts_task_notifications_linked_to_the_task', async () => {
    const client = createMockMessagesClient({ storage: null });
    const task: WhatseekTask = {
      id: 'task-x',
      title: '生成视频',
      intent: 'CREATE_CONTENT',
      state: 'completed',
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:01.000Z',
      resultSummary: '生成视频',
    };
    await client.postTaskNotification(task);
    const conversations = await client.listConversations();
    const entry = conversations.find((conversation) => conversation.taskId === 'task-x');
    expect(entry).toBeDefined();
    expect(entry?.kind).toBe('task');
    const messages = await client.listMessages(entry?.id ?? '');
    expect(messages.some((message) => message.kind === 'task')).toBe(true);
  });
});

describe('conversationKindGlyph', () => {
  it('maps_each_conversation_kind_to_a_glyph', () => {
    expect(conversationKindGlyph('task')).not.toBe(conversationKindGlyph('group'));
    expect(conversationKindGlyph('direct', { avatar: '🧑' } as never)).toBe('🧑');
  });
});
