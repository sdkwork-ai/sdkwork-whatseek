import { describe, expect, it } from 'vitest';

import { createMockChatClient } from '../src/services/chatClient.js';
import { createMockTasksClient } from '../src/services/tasksClient.js';
import type { AppRecommendation, AppsPort, Contact, ContactsPort, MessagesPort } from '@sdkwork/whatseek-pc-core';

function fakeDeps(overrides: {
  searchApps?: (query: string) => Promise<AppRecommendation[]>;
  searchContacts?: (query: string) => Promise<Contact[]>;
} = {}) {
  const tasks = createMockTasksClient({ storage: null });
    const apps: AppsPort = {
      searchApps: overrides.searchApps ?? (async () => []),
      listTrendingSearches: async () => [],
      listSearchSuggestions: async () => [],
      listHomeFeed: async () => ({ heroes: [], stories: [], collections: [], charts: [] }),
      getCollection: async () => null,
      listCollectionApps: async () => [],
      listChart: async () => [],
      listRecommended: async () => [],
      listHot: async () => [],
      listCategories: async () => [],
      listByCategory: async () => [],
      getApp: async () => null,
      getAppDetail: async () => null,
      listSimilarApps: async () => [],
      listRecent: async () => [],
      recordRecent: async () => undefined,
      listFavorites: async () => [],
      toggleFavorite: async () => true,
      listMyApps: async () => [],
      getMyApp: async () => null,
      deleteMyApp: async () => undefined,
      draftCreationPlan: (requirement) => ({
        title: `「${requirement}」方案`,
        modules: ['客户列表', '数据统计'],
        pages: ['客户 360 视图', '跟进时间线'],
        dataModel: ['客户', '跟进记录'],
      }),
      createAppFromPlan: async (requirement, modules) => ({
        id: 'gen-1',
        name: '客户管理系统',
        requirement,
        modules: [...modules],
        lifecycle: 'preview',
        createdAt: '2026-10-01T00:00:00.000Z',
        updatedAt: '2026-10-01T00:00:00.000Z',
        versions: ['0.1.0'],
        icon: '🧩',
      }),
      modifyApp: async () => {
        throw new Error('not needed');
      },
      publishApp: async () => {
        throw new Error('not needed');
      },
    };
    const contacts: ContactsPort = {
      listContacts: async () => [],
      searchContacts:
        overrides.searchContacts ??
        (async () => [{ id: 'c-1', name: '张三', kind: 'person', bio: '', tags: [], avatar: '🙂' }]),
      getContact: async () => null,
    };
  const messages: MessagesPort = {
    listConversations: async () => [],
    listMessages: async () => [],
    sendMessage: async (conversationId, content) => ({
      id: 'm-1',
      conversationId,
      senderId: 'me',
      senderName: 'me',
      content,
      sentAt: '2026-10-01T00:00:00.000Z',
      kind: 'text',
    }),
    markRead: async () => undefined,
    openDirectConversation: async () => ({
      id: 'conv-1',
      kind: 'direct',
      title: '张三',
      contactId: 'c-1',
      unread: 0,
      updatedAt: '2026-10-01T00:00:00.000Z',
    }),
    postTaskNotification: async () => undefined,
    getUnreadTotal: async () => 0,
  };
  return { apps, contacts, messages, tasks };
}

/** Immediate scheduler: runs callbacks synchronously for deterministic tests. */
function immediateScheduler(): { scheduler: (callback: () => void) => () => void; flushed: () => boolean } {
  return {
    scheduler: (callback) => {
      callback();
      return () => undefined;
    },
    flushed: () => true,
  };
}

describe('mock chat client (AI router)', () => {
  it('routes_SEARCH_APP_to_app_result_cards_when_apps_match', async () => {
    const deps = fakeDeps({
      searchApps: async () => [
        {
          app: {
            id: 'clip-master',
            name: '剪辑大师',
            summary: '',
            developer: '',
            category: 'video',
            kind: 'ai',
            icon: '🎬',
            rating: 4.8,
            usersLabel: '1万',
            priceLabel: '免费',
            aiCapability: true,
            tags: [],
            updatedAt: '2026-09-28',
            permissions: [],
          },
          reason: '视频剪辑',
        },
      ],
    });
    const chat = createMockChatClient(deps, { replyDelayMs: 0, scheduler: (cb) => immediateScheduler().scheduler(cb) });
    const reply = await chat.handleSend('帮我找一个视频剪辑工具');
    expect(reply.contentKey).toBe('whatseek.chat.reply.searchApp.found');
    expect(reply.cards?.[0]?.type).toBe('app_results');
  });

  it('falls_back_to_a_creation_plan_when_no_app_matches_(create_as_default)', async () => {
    const deps = fakeDeps();
    const chat = createMockChatClient(deps, { replyDelayMs: 0, scheduler: (cb) => immediateScheduler().scheduler(cb) });
    const reply = await chat.handleSend('帮我找一个量子折叠机管理工具');
    expect(reply.contentKey).toBe('whatseek.chat.reply.searchApp.notFoundCreate');
    const card = reply.cards?.[0];
    expect(card?.type).toBe('app_plan');
  });

  it('routes_CREATE_APP_to_a_plan_card', async () => {
    const deps = fakeDeps();
    const chat = createMockChatClient(deps, { replyDelayMs: 0, scheduler: (cb) => immediateScheduler().scheduler(cb) });
    const reply = await chat.handleSend('帮我做一个库存管理系统');
    expect(reply.contentKey).toBe('whatseek.chat.reply.createApp.plan');
    expect(reply.cards?.[0]?.type).toBe('app_plan');
  });

  it('routes_SEND_MESSAGE_to_a_confirmation_card_and_requires_explicit_confirm', async () => {
    const deps = fakeDeps();
    let sent = false;
    deps.messages.sendMessage = async (conversationId, content) => {
      sent = true;
      return {
        id: 'm-1',
        conversationId,
        senderId: 'me',
        senderName: 'me',
        content,
        sentAt: '2026-10-01T00:00:00.000Z',
        kind: 'text',
      };
    };
    const chat = createMockChatClient(deps, { replyDelayMs: 0, scheduler: (cb) => immediateScheduler().scheduler(cb) });
    const reply = await chat.handleSend('给张三发消息，告诉他下午三点开会');
    expect(reply.cards?.[0]?.type).toBe('send_message_confirm');
    expect(sent).toBe(false);
    const outcome = await chat.runCardAction({
      kind: 'confirm_send_message',
      contactId: 'c-1',
      contactName: '张三',
      draft: '下午三点开会',
    });
    expect(sent).toBe(true);
    expect(outcome.message).toBe('whatseek.chat.reply.action.messageSent');
    expect(outcome.conversationId).toBe('conv-1');
  });

  it('runs_the_generate_app_action_through_task_states_and_returns_the_created_app', async () => {
    const deps = fakeDeps();
    const chat = createMockChatClient(deps, { replyDelayMs: 0, taskStepMs: 0, scheduler: (cb) => immediateScheduler().scheduler(cb) });
    const outcome = await chat.runCardAction({
      kind: 'generate_app',
      requirement: '帮我做一个库存管理系统',
      modules: ['库存盘点'],
    });
    expect(outcome.message).toBe('whatseek.chat.reply.action.appGenerated');
    expect(outcome.createdAppId).toBe('gen-1');
    const task = await deps.tasks.getTask(outcome.taskId ?? '');
    expect(task?.state).toBe('completed');
    expect(task?.createdAppId).toBe('gen-1');
  });

  it('routes_supplier_queries_to_commerce_preview_results', async () => {
    const deps = fakeDeps();
    const chat = createMockChatClient(deps, { replyDelayMs: 0, scheduler: (cb) => immediateScheduler().scheduler(cb) });
    const reply = await chat.handleSend('找一个支持定制的手机壳供应商');
    expect(reply.contentKey).toBe('whatseek.chat.reply.searchSupplier');
    expect(reply.cards?.[0]?.type).toBe('commerce_results');
  });

  it('parks_a_content_task_at_waiting_confirmation_until_the_user_confirms', async () => {
    const deps = fakeDeps();
    const notified: string[] = [];
    deps.messages.postTaskNotification = async (task) => {
      notified.push(task.id);
    };
    const chat = createMockChatClient(deps, { replyDelayMs: 0, taskStepMs: 0, scheduler: (cb) => immediateScheduler().scheduler(cb) });
    const reply = await chat.handleSend('帮我做一张商品海报');
    expect(reply.contentKey).toBe('whatseek.chat.reply.task.accepted');
    expect(reply.taskId).toBeDefined();
    // Flush the background task chain (microtasks) before asserting.
    await new Promise<void>((resolve) => {
      globalThis.setTimeout(resolve, 0);
    });
    const parked = await deps.tasks.getTask(reply.taskId ?? '');
    expect(parked?.state).toBe('waiting_confirmation');
    expect(notified).toEqual([]);

    const outcome = await chat.runCardAction({ kind: 'confirm_task', taskId: reply.taskId ?? '' });
    expect(outcome.message).toBe('whatseek.chat.reply.action.taskConfirmed');
    const confirmed = await deps.tasks.getTask(reply.taskId ?? '');
    expect(confirmed?.state).toBe('completed');
    expect(notified).toEqual([reply.taskId]);
  });

  it('cancels_a_waiting_task_from_user_action_and_notifies_the_cancellation', async () => {
    const deps = fakeDeps();
    const notifiedStates: string[] = [];
    deps.messages.postTaskNotification = async (task) => {
      notifiedStates.push(task.state);
    };
    const chat = createMockChatClient(deps, { replyDelayMs: 0, taskStepMs: 0, scheduler: (cb) => immediateScheduler().scheduler(cb) });
    const reply = await chat.handleSend('帮我做一张商品海报');
    await new Promise<void>((resolve) => {
      globalThis.setTimeout(resolve, 0);
    });
    const outcome = await chat.runCardAction({ kind: 'cancel_task', taskId: reply.taskId ?? '' });
    expect(outcome.message).toBe('whatseek.chat.reply.action.taskCancelled');
    const cancelled = await deps.tasks.getTask(reply.taskId ?? '');
    expect(cancelled?.state).toBe('cancelled');
    expect(notifiedStates).toEqual(['cancelled']);
  });
});

describe('mock tasks client', () => {
  it('transitions_states_and_keeps_history_in_memory_when_storage_is_null', async () => {
    const tasks = createMockTasksClient({ storage: null });
    const task = await tasks.createTask({ title: '生成视频', intent: 'CREATE_CONTENT' });
    expect(task.state).toBe('pending');
    const running = await tasks.updateTaskState(task.id, 'running');
    expect(running.state).toBe('running');
    const completed = await tasks.updateTaskState(task.id, 'completed', '视频已生成');
    expect(completed.state).toBe('completed');
    expect(completed.resultSummary).toBe('视频已生成');
    expect(await tasks.getTask(task.id)).not.toBeNull();
  });

  it('rejects_updates_for_unknown_tasks', async () => {
    const tasks = createMockTasksClient({ storage: null });
    await expect(tasks.updateTaskState('missing', 'running')).rejects.toThrowError(/task not found/u);
  });

  it('lazily_expires_an_abandoned_waiting_confirmation_task_on_read', async () => {
    let clock = new Date('2026-10-03T10:00:00.000Z');
    const tasks = createMockTasksClient({ storage: null, waitingExpiryMs: 1000, now: () => clock });
    const task = await tasks.createTask({ title: '生成海报', intent: 'CREATE_CONTENT' });
    await tasks.updateTaskState(task.id, 'waiting_confirmation');
    clock = new Date('2026-10-03T10:01:00.000Z');
    expect((await tasks.getTask(task.id))?.state).toBe('expired');
  });
});
