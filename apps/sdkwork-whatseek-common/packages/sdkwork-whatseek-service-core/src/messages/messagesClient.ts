/**
 * Unified message center (PRD §27): private/group chat, system/app/agent
 * notifications, and AI task notifications in one event stream. Mock
 * implementation persists to localStorage; Phase 2 swaps in the IM SDK
 * client behind the same port.
 */

import type {
  ChatMessage,
  Contact,
  Conversation,
  ConversationKind,
  WhatseekTask,
} from '../types.js';
import type { MessagesPort } from '../ports.js';

interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const STATE_KEY = 'whatseek.messages-state';

interface PersistedState {
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
}

function defaultStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function seedState(nowIso: string): PersistedState {
  const conversations: Conversation[] = [
    { id: 'conv-zhangsan', kind: 'direct', title: '张三', contactId: 'zhangsan', unread: 1, updatedAt: nowIso, lastMessagePreview: '下午三点开会记得参加。' },
    { id: 'conv-design', kind: 'group', title: '设计团队', contactId: 'design-team', unread: 0, updatedAt: nowIso, lastMessagePreview: '新首页方案已上传。' },
    { id: 'conv-agent-news', kind: 'agent', title: '行业新闻整理 Agent', contactId: 'agent-news', unread: 2, updatedAt: nowIso, lastMessagePreview: '今日行业新闻摘要已生成。' },
    { id: 'conv-supplier', kind: 'direct', title: '上海锦裳服饰', contactId: 'supplier-jinshang', unread: 0, updatedAt: nowIso, lastMessagePreview: '样品已寄出，请注意查收。' },
    { id: 'conv-system', kind: 'system', titleKey: 'whatseek.messages.kind.system', unread: 0, updatedAt: nowIso, lastMessagePreview: '欢迎来到问寻。' },
    { id: 'conv-task-video', kind: 'task', titleKey: 'whatseek.messages.kind.task', taskId: 'task-demo-video', unread: 1, updatedAt: nowIso, lastMessagePreview: '你要求的视频已经生成。' },
    { id: 'conv-app-update', kind: 'app', titleKey: 'whatseek.messages.kind.app', appId: 'clip-master', unread: 0, updatedAt: nowIso, lastMessagePreview: '剪辑大师已更新到 v2.1，新增多轨道时间线。' },
  ];
  const messages: Record<string, ChatMessage[]> = {
    'conv-zhangsan': [
      { id: 'm-1', conversationId: 'conv-zhangsan', senderId: 'zhangsan', senderName: '张三', content: '下午三点开会记得参加。', sentAt: nowIso, kind: 'text' },
    ],
    'conv-design': [
      { id: 'm-2', conversationId: 'conv-design', senderId: 'design-team', senderName: '设计团队', content: '新首页方案已上传。', sentAt: nowIso, kind: 'text' },
    ],
    'conv-agent-news': [
      { id: 'm-3', conversationId: 'conv-agent-news', senderId: 'agent-news', senderName: '行业新闻整理 Agent', content: '今日行业新闻摘要已生成。', sentAt: nowIso, kind: 'text' },
      { id: 'm-4', conversationId: 'conv-agent-news', senderId: 'agent-news', senderName: '行业新闻整理 Agent', content: 'AI Coding 周报已更新。', sentAt: nowIso, kind: 'text' },
    ],
    'conv-supplier': [
      { id: 'm-5', conversationId: 'conv-supplier', senderId: 'supplier-jinshang', senderName: '上海锦裳服饰', content: '样品已寄出，请注意查收。', sentAt: nowIso, kind: 'text' },
    ],
    'conv-system': [
      { id: 'm-6', conversationId: 'conv-system', senderId: 'system', senderName: '问寻', content: '欢迎来到问寻。', sentAt: nowIso, kind: 'system' },
    ],
    'conv-task-video': [
      { id: 'm-7', conversationId: 'conv-task-video', senderId: 'task', senderName: '问寻 AI', content: '你要求的视频已经生成。', sentAt: nowIso, kind: 'task' },
    ],
    'conv-app-update': [
      { id: 'm-8', conversationId: 'conv-app-update', senderId: 'app', senderName: '问寻', content: '剪辑大师已更新到 v2.1，新增多轨道时间线。', sentAt: nowIso, kind: 'system' },
    ],
  };
  return { conversations, messages };
}

export interface MockMessagesClientOptions {
  storage?: Storage | null;
  now?: () => Date;
  /** Auto-reply delay for demo liveliness in direct conversations (ms). */
  autoReplyMs?: number;
}

export function createMockMessagesClient(options: MockMessagesClientOptions = {}): MessagesPort {
  const storage = options.storage === undefined ? defaultStorage() : options.storage;
  const now = options.now ?? (() => new Date());
  const autoReplyMs = options.autoReplyMs ?? 800;

  let state: PersistedState;
  if (storage !== null) {
    try {
      const raw = storage.getItem(STATE_KEY);
      const parsed: unknown = raw === null ? null : JSON.parse(raw);
      state =
        parsed !== null &&
        typeof parsed === 'object' &&
        Array.isArray((parsed as PersistedState).conversations)
          ? (parsed as PersistedState)
          : seedState(now().toISOString());
    } catch {
      state = seedState(now().toISOString());
    }
  } else {
    state = seedState(now().toISOString());
  }

  const persist = () => {
    if (storage !== null) {
      try {
        storage.setItem(STATE_KEY, JSON.stringify(state));
      } catch {
        /* storage unavailable */
      }
    }
  };

  const touch = (conversationId: string, preview: string) => {
    state.conversations = state.conversations.map((conversation) =>
      conversation.id === conversationId
        ? { ...conversation, updatedAt: now().toISOString(), lastMessagePreview: preview }
        : conversation,
    );
  };

  return {
    async listConversations() {
      return [...state.conversations].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    },
    async listMessages(conversationId) {
      return [...(state.messages[conversationId] ?? [])];
    },
    async sendMessage(conversationId, content) {
      const conversation = state.conversations.find((entry) => entry.id === conversationId);
      if (conversation === undefined) {
        throw new Error(`conversation not found: ${conversationId}`);
      }
      const stamp = now();
      const message: ChatMessage = {
        id: `m-${stamp.getTime().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
        conversationId,
        senderId: 'me',
        senderName: '我',
        content,
        sentAt: stamp.toISOString(),
        kind: 'text',
      };
      state.messages[conversationId] = [...(state.messages[conversationId] ?? []), message];
      touch(conversationId, content);
      persist();
      const contactId = conversation.contactId;
      if (contactId !== undefined && (conversation.kind === 'direct' || conversation.kind === 'agent')) {
        const replyContent =
          conversation.kind === 'agent'
            ? '收到，我已开始处理这个请求。'
            : '好的，收到！';
        globalThis.setTimeout?.(() => {
          const reply: ChatMessage = {
            id: `m-${Date.now().toString(36)}-reply`,
            conversationId,
            senderId: contactId,
            senderName: conversation.title ?? '对方',
            content: replyContent,
            sentAt: new Date().toISOString(),
            kind: 'text',
          };
          state.messages[conversationId] = [...(state.messages[conversationId] ?? []), reply];
          touch(conversationId, replyContent);
          persist();
        }, autoReplyMs);
      }
      return message;
    },
    async markRead(conversationId) {
      state.conversations = state.conversations.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, unread: 0 } : conversation,
      );
      persist();
    },
    async openDirectConversation(contactId) {
      const existing = state.conversations.find(
        (conversation) => conversation.kind === 'direct' && conversation.contactId === contactId,
      );
      if (existing !== undefined) {
        return existing;
      }
      const created: Conversation = {
        id: `conv-${contactId}`,
        kind: 'direct',
        title: contactId,
        contactId,
        unread: 0,
        updatedAt: now().toISOString(),
      };
      state.conversations = [created, ...state.conversations];
      state.messages[created.id] = [];
      persist();
      return created;
    },
    async postTaskNotification(task: WhatseekTask) {
      const conversationId = `conv-task-${task.id}`;
      const existing = state.conversations.find((conversation) => conversation.id === conversationId);
      const content = task.resultSummary ?? task.title;
      const outcomeKey =
        task.state === 'cancelled' ? 'cancelled' : task.state === 'expired' ? 'expired' : 'completed';
      const outcomeCopy: Record<'completed' | 'cancelled' | 'expired', string> = {
        completed: '已完成。',
        cancelled: '已取消。',
        expired: '已过期。',
      };
      const message: ChatMessage = {
        id: `m-${task.id}-${outcomeKey}`,
        conversationId,
        senderId: 'task',
        senderName: '问寻 AI',
        content: `「${content}」${outcomeCopy[outcomeKey]}`,
        sentAt: now().toISOString(),
        kind: 'task',
      };
      if (existing === undefined) {
        const conversation: Conversation = {
          id: conversationId,
          kind: 'task',
          titleKey: 'whatseek.messages.kind.task',
          taskId: task.id,
          unread: 1,
          updatedAt: message.sentAt,
          lastMessagePreview: message.content,
        };
        state.conversations = [conversation, ...state.conversations];
        state.messages[conversationId] = [message];
      } else {
        state.messages[conversationId] = [...(state.messages[conversationId] ?? []), message];
        touch(conversationId, message.content);
      }
      persist();
    },
    async getUnreadTotal() {
      return state.conversations.reduce((total, conversation) => total + conversation.unread, 0);
    },
  };
}

export function conversationKindGlyph(kind: ConversationKind, contact?: Contact | null): string {
  switch (kind) {
    case 'direct':
      return contact?.avatar ?? '🙂';
    case 'group':
      return '👥';
    case 'system':
      return '📣';
    case 'app':
      return '🧩';
    case 'agent':
      return '🤖';
    case 'task':
      return '✅';
    default:
      return '💬';
  }
}
