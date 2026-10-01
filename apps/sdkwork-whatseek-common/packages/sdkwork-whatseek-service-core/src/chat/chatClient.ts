/**
 * Mock AI chat client: the AI Router (PRD §11). Intent recognition → route:
 *
 *   SEARCH_APP        → app result cards (Create-as-Default plan on empty)
 *   CREATE_APP        → generation plan card + generation task
 *   SEND_MESSAGE      → contact lookup + confirmation card (explicit confirm)
 *   SEARCH_PERSON     → contact result cards
 *   SEARCH_PRODUCT /
 *   SEARCH_SUPPLIER /
 *   SEARCH_SERVICE    → commerce preview results (P2 preview)
 *   CREATE_CONTENT    → content generation task
 *   GENERAL_CHAT      → helpful reply
 *
 * Replies carry i18n keys (`whatseek.chat.reply.*`) so the UI translates them.
 */

import type {
  ChatCard,
  CommerceResult,
  Contact,
} from '../types.js';
import type {
  AppsPort,
  ChatPort,
  ContactsPort,
  MessagesPort,
  TasksPort,
} from '../ports.js';

import { recognizeIntent } from '@sdkwork/whatseek-intent-core';

export type Scheduler = (callback: () => void, delayMs: number) => () => void;

function defaultScheduler(callback: () => void, delayMs: number): () => void {
  const handle = globalThis.setTimeout(callback, delayMs);
  return () => {
    globalThis.clearTimeout(handle);
  };
}

interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const DRAFT_KEY = 'whatseek.pending-send-drafts';

function defaultStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

const COMMERCE_PRESETS: Record<'product' | 'supplier' | 'service', readonly CommerceResult[]> = {
  product: [
    { id: 'p-1', title: '黑色圆领 T 恤 220g', subtitle: '纯棉 · 支持定制印花 · 起订 100 件', priceLabel: '¥12.5/件' },
    { id: 'p-2', title: '速干 T 恤 批发款', subtitle: '速干面料 · 8 色可选 · 起订 50 件', priceLabel: '¥18/件' },
    { id: 'p-3', title: '重磅纯色 T 恤', subtitle: '260g 重磅 · 小单快返', priceLabel: '¥25/件' },
  ],
  supplier: [
    { id: 's-1', title: '上海锦裳服饰有限公司', subtitle: 'T 恤/卫衣 · 支持定制 · 7 天打样', priceLabel: '起订 ¥20 以内' },
    { id: 's-2', title: '广州佰 clothes 制衣厂', subtitle: '跨境快返 · 1000 件起 · SGS 认证', priceLabel: '¥11 起/件' },
    { id: 's-3', title: '义乌市皓瀚服饰', subtitle: '现货混批 · 一件代发', priceLabel: '¥9.9 起/件' },
  ],
  service: [
    { id: 'sv-1', title: '跨境代运营服务', subtitle: '店铺搭建 + 投放 · 按月服务', priceLabel: '¥3000/月' },
    { id: 'sv-2', title: '商品拍摄服务', subtitle: '白底图/场景图 · 48h 交付', priceLabel: '¥80/张' },
    { id: 'sv-3', title: '独立站 SEO 咨询', subtitle: '关键词策略 + 内容规划', priceLabel: '¥1500/次' },
  ],
};

export interface MockChatClientDeps {
  apps: AppsPort;
  contacts: ContactsPort;
  messages: MessagesPort;
  tasks: TasksPort;
}

export interface MockChatClientOptions {
  /** Reply latency in ms (default 320). */
  replyDelayMs?: number;
  /** Task state-transition step in ms (default 600). */
  taskStepMs?: number;
  scheduler?: Scheduler;
  storage?: Storage | null;
}

function extractContactName(text: string): string | null {
  const patterns = [
    /(?:给|替|帮[\u4e00-\u9fa5]{0,2}?)([\u4e00-\u9fa5a-zA-Z0-9]{2,8})(?:发|送|说|留言|发消息)/u,
    /联系(?:一下)?([\u4e00-\u9fa5a-zA-Z0-9]{2,8})/u,
    /找([\u4e00-\u9fa5a-zA-Z0-9]{2,8})(?:发消息|说|留言)/u,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    const name = match?.[1];
    if (name !== undefined && name.length > 0) {
      return name;
    }
  }
  return null;
}

function extractDraftMessage(text: string): string | null {
  const match = /(?:告诉(?:他|她|它)|跟(?:他|她)说|说|内容是)[：:]?\s*(.+)$/u.exec(text.trim());
  const draft = match?.[1];
  if (draft !== undefined && draft.trim().length > 0) {
    return draft.trim();
  }
  return null;
}

export function createMockChatClient(deps: MockChatClientDeps, options: MockChatClientOptions = {}): ChatPort {
  const replyDelayMs = options.replyDelayMs ?? 320;
  const taskStepMs = options.taskStepMs ?? 600;
  const schedule = options.scheduler ?? defaultScheduler;
  const storage = options.storage === undefined ? defaultStorage() : options.storage;

  const delay = (ms: number) =>
    new Promise<void>((resolve) => {
      schedule(resolve, ms);
    });

  const saveDraft = (contactId: string, draft: string) => {
    if (storage === null) {
      return;
    }
    try {
      storage.setItem(DRAFT_KEY, `${contactId}\n${draft}`);
    } catch {
      /* ignore */
    }
  };

  return {
    async handleSend(text) {
      const intent = recognizeIntent(text);
      await delay(replyDelayMs);
      const cards: ChatCard[] = [];

      switch (intent.intent) {
        case 'SEARCH_APP': {
          const results = await deps.apps.searchApps(text);
          if (results.length > 0) {
            cards.push({ type: 'app_results', apps: results.slice(0, 3) });
            return {
              contentKey: 'whatseek.chat.reply.searchApp.found',
              contentParams: { count: results.length },
              cards,
            };
          }
          const plan = deps.apps.draftCreationPlan(text);
          cards.push({
            type: 'app_plan',
            title: plan.title,
            modules: plan.modules,
            requirement: text.trim(),
          });
          return {
            contentKey: 'whatseek.chat.reply.searchApp.notFoundCreate',
            cards,
          };
        }
        case 'CREATE_APP': {
          const plan = deps.apps.draftCreationPlan(text);
          cards.push({
            type: 'app_plan',
            title: plan.title,
            modules: plan.modules,
            requirement: text.trim(),
          });
          return { contentKey: 'whatseek.chat.reply.createApp.plan', cards };
        }
        case 'SEND_MESSAGE': {
          const name = extractContactName(text);
          const matches =
            name !== null ? await deps.contacts.searchContacts(name) : await deps.contacts.listContacts();
          const contact: Contact | undefined = matches[0];
          if (contact === undefined) {
            return { contentKey: 'whatseek.chat.reply.sendMessage.contactNotFound' };
          }
          const draft = extractDraftMessage(text) ?? text.trim();
          saveDraft(contact.id, draft);
          cards.push({
            type: 'send_message_confirm',
            contactId: contact.id,
            contactName: contact.name,
            draft,
          });
          return { contentKey: 'whatseek.chat.reply.sendMessage.confirm', cards };
        }
        case 'SEARCH_PERSON': {
          const matches = await deps.contacts.searchContacts(text);
          if (matches.length > 0) {
            cards.push({ type: 'contact_results', contacts: matches.slice(0, 4) });
            return { contentKey: 'whatseek.chat.reply.searchPerson.found', cards };
          }
          return { contentKey: 'whatseek.chat.reply.searchPerson.notFound' };
        }
        case 'SEARCH_PRODUCT':
        case 'SEARCH_SUPPLIER':
        case 'SEARCH_SERVICE': {
          const domain =
            intent.intent === 'SEARCH_SUPPLIER' ? 'supplier' : intent.intent === 'SEARCH_SERVICE' ? 'service' : 'product';
          cards.push({ type: 'commerce_results', domain, items: COMMERCE_PRESETS[domain].slice(0, 3) });
          return {
            contentKey:
              intent.intent === 'SEARCH_SUPPLIER'
                ? 'whatseek.chat.reply.searchSupplier'
                : intent.intent === 'SEARCH_SERVICE'
                  ? 'whatseek.chat.reply.searchService'
                  : 'whatseek.chat.reply.searchProduct',
            cards,
          };
        }
        case 'CREATE_CONTENT': {
          const task = await deps.tasks.createTask({ title: text.trim(), intent: intent.intent });
          void schedule(() => {
            void deps.tasks
              .updateTaskState(task.id, 'running')
              .then(() => delay(taskStepMs))
              .then(() => deps.tasks.updateTaskState(task.id, 'completed', text.trim()))
              .then((completed) => {
                void deps.messages.postTaskNotification(completed);
              })
              .catch(() => undefined);
          }, taskStepMs);
          return {
            contentKey: 'whatseek.chat.reply.createContent.accepted',
            taskId: task.id,
          };
        }
        case 'SEARCH_AGENT':
        case 'CREATE_AGENT':
        case 'USE_AGENT':
        case 'EDIT_CONTENT':
        case 'USE_APP':
        case 'EXECUTE_TASK':
        case 'GENERAL_CHAT':
        default:
          return { contentKey: 'whatseek.chat.reply.general' };
      }
    },

    async runCardAction(action) {
      switch (action.kind) {
        case 'generate_app': {
          const task = await deps.tasks.createTask({
            title: action.requirement,
            intent: 'CREATE_APP',
          });
          await deps.tasks.updateTaskState(task.id, 'running');
          await delay(taskStepMs);
          const created = await deps.apps.createAppFromPlan(action.requirement, action.modules);
          const completed = await deps.tasks.updateTaskState(
            task.id,
            'completed',
            created.name,
          );
          completed.createdAppId = created.id;
          void deps.messages.postTaskNotification(completed);
          return {
            message: 'whatseek.chat.reply.action.appGenerated',
            messageParams: { name: created.name },
            createdAppId: created.id,
            taskId: task.id,
          };
        }
        case 'confirm_send_message': {
          const task = await deps.tasks.createTask({
            title: action.draft,
            intent: 'SEND_MESSAGE',
          });
          await deps.tasks.updateTaskState(task.id, 'running');
          const conversation = await deps.messages.openDirectConversation(action.contactId);
          await deps.messages.sendMessage(conversation.id, action.draft);
          await deps.messages.markRead(conversation.id);
          await deps.tasks.updateTaskState(task.id, 'completed', conversation.title ?? conversation.id);
          return {
            message: 'whatseek.chat.reply.action.messageSent',
            messageParams: { name: action.contactName },
            conversationId: conversation.id,
            taskId: task.id,
          };
        }
        case 'use_app':
        case 'create_from_app':
        case 'open_contact':
          // Navigation actions are handled by the UI directly; the client treats
          // them as no-ops with a neutral outcome.
          return { message: 'whatseek.chat.reply.action.navigated' };
        default: {
          const exhaustive: never = action;
          return exhaustive;
        }
      }
    },
  };
}
