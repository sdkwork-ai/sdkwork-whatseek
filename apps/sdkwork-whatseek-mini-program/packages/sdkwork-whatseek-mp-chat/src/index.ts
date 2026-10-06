/**
 * Public export boundary of `@sdkwork/whatseek-mp-chat` — chat turn service
 * for the native chat page. Wraps the shared ChatPort: pages receive plain
 * view models, never clients. Reply text resolves through the package i18n
 * fragments (`src/i18n/<locale>/whatseek/chat/strings.json`), zh-CN by default
 * with en-US selected via `setChatLocale`.
 */

import type { ChatCardAction, ChatCard, ChatReply } from '@sdkwork/whatseek-service-core';
import { getWhatseekClient } from '@sdkwork/whatseek-service-core';

import enReplies from './i18n/en-US/whatseek/chat/strings.json';
import zhReplies from './i18n/zh-CN/whatseek/chat/strings.json';

export interface ChatEntryView {
  role: 'user' | 'assistant';
  /** User turns: literal text. Assistant turns: localized router text. */
  text: string;
  taskId?: string;
}

export interface ChatCardView {
  type: ChatCard['type'];
  apps: { id: string; name: string; summary: string; priceLabel: string; reason: string; aiCapability: boolean }[];
  plan: { title: string; modules: string[]; requirement: string } | null;
  sendMessage: { contactId: string; contactName: string; draft: string } | null;
  commerce: { domain: string; items: { id: string; title: string; subtitle: string; priceLabel: string }[] } | null;
  contacts: { id: string; name: string; bio: string }[];
}

type ReplyKeys = keyof typeof zhReplies.reply;

/** Flat reply keys; dotted-path keys (`searchAgent.found`) resolve through the fragments directly. */
const REPLY_TEXT: Partial<Record<ReplyKeys, Record<'zh-CN' | 'en-US', string>>> = {
  searchAppFound: { 'zh-CN': zhReplies.reply.searchAppFound, 'en-US': enReplies.reply.searchAppFound },
  searchAppNotFoundCreate: { 'zh-CN': zhReplies.reply.searchAppNotFoundCreate, 'en-US': enReplies.reply.searchAppNotFoundCreate },
  createAppPlan: { 'zh-CN': zhReplies.reply.createAppPlan, 'en-US': enReplies.reply.createAppPlan },
  sendMessageConfirm: { 'zh-CN': zhReplies.reply.sendMessageConfirm, 'en-US': enReplies.reply.sendMessageConfirm },
  sendMessageContactNotFound: { 'zh-CN': zhReplies.reply.sendMessageContactNotFound, 'en-US': enReplies.reply.sendMessageContactNotFound },
  searchPersonFound: { 'zh-CN': zhReplies.reply.searchPersonFound, 'en-US': enReplies.reply.searchPersonFound },
  searchPersonNotFound: { 'zh-CN': zhReplies.reply.searchPersonNotFound, 'en-US': enReplies.reply.searchPersonNotFound },
  searchSupplier: { 'zh-CN': zhReplies.reply.searchSupplier, 'en-US': enReplies.reply.searchSupplier },
  commercePreview: { 'zh-CN': zhReplies.reply.commercePreview, 'en-US': enReplies.reply.commercePreview },
  createContentAccepted: { 'zh-CN': zhReplies.reply.createContentAccepted, 'en-US': enReplies.reply.createContentAccepted },
  general: { 'zh-CN': zhReplies.reply.general, 'en-US': enReplies.reply.general },
  error: { 'zh-CN': zhReplies.reply.error, 'en-US': enReplies.reply.error },
  actionAppGenerated: { 'zh-CN': zhReplies.reply.actionAppGenerated, 'en-US': enReplies.reply.actionAppGenerated },
  actionMessageSent: { 'zh-CN': zhReplies.reply.actionMessageSent, 'en-US': enReplies.reply.actionMessageSent },
  actionTaskConfirmed: { 'zh-CN': zhReplies.reply.actionTaskConfirmed, 'en-US': enReplies.reply.actionTaskConfirmed },
  actionTaskCancelled: { 'zh-CN': zhReplies.reply.actionTaskCancelled, 'en-US': enReplies.reply.actionTaskCancelled },
  actionTaskInactive: { 'zh-CN': zhReplies.reply.actionTaskInactive, 'en-US': enReplies.reply.actionTaskInactive },
  actionNavigated: { 'zh-CN': zhReplies.reply.actionNavigated, 'en-US': enReplies.reply.actionNavigated },
};

let chatLocale: 'zh-CN' | 'en-US' = 'zh-CN';

export function setChatLocale(locale: 'zh-CN' | 'en-US'): void {
  chatLocale = locale;
}

/** Widen JSON-import literal types to plain strings, keeping the key structure. */
type WidenStrings<T> = T extends string ? string : { -readonly [K in keyof T]: WidenStrings<T[K]> };

export type ChatStrings = WidenStrings<typeof zhReplies>;

/** Localized chat page chrome strings for the current locale; pages bind this into `data`. */
export function strings(): ChatStrings {
  return chatLocale === 'en-US' ? enReplies : zhReplies;
}

const TASK_STATE_LABELS: Record<'zh-CN' | 'en-US', Record<string, string>> = {
  'zh-CN': zhReplies.task,
  'en-US': enReplies.task,
};

/**
 * Localized task-chip label for all seven PRD §41 states
 * (`whatseek.chat.task.*`, key-aligned with the H5/PC chat fragments).
 */
export function taskStateLabel(state: string): string {
  return TASK_STATE_LABELS[chatLocale][state] ?? state;
}

/** `searchApp.found` → `searchAppFound`: dotted router keys meet flat fragments. */
function flattenReplyKey(key: string): string {
  if (!key.includes('.')) {
    return key;
  }
  return key
    .split('.')
    .map((segment, index) => (index === 0 ? segment : segment.charAt(0).toUpperCase() + segment.slice(1)))
    .join('');
}

/** Resolve a dotted reply path (`searchAgent.found`) against the fragments. */
function resolveNestedReply(path: string): Record<'zh-CN' | 'en-US', string> | undefined {
  let zh: unknown = zhReplies.reply;
  let en: unknown = enReplies.reply;
  for (const segment of path.split('.')) {
    if (typeof zh !== 'object' || zh === null || typeof en !== 'object' || en === null) {
      return undefined;
    }
    zh = (zh as Record<string, unknown>)[segment];
    en = (en as Record<string, unknown>)[segment];
  }
  if (typeof zh !== 'string' || typeof en !== 'string') {
    return undefined;
  }
  return { 'zh-CN': zh, 'en-US': en };
}

function resolveReplyEntry(key: string): Record<'zh-CN' | 'en-US', string> | undefined {
  const flat = flattenReplyKey(key);
  const direct = REPLY_TEXT[key as ReplyKeys] ?? REPLY_TEXT[flat as ReplyKeys];
  return direct ?? resolveNestedReply(key);
}

/** Replace single-brace `{param}` placeholders (fragment convention) with values. */
function interpolateReply(text: string, params: Record<string, unknown> | undefined): string {
  if (params === undefined) {
    return text;
  }
  return text.replace(/\{(\w+)\}/gu, (match, name: string) => (name in params ? String(params[name]) : match));
}

export function replyText(reply: Pick<ChatReply, 'contentKey' | 'contentParams'>): string {
  // contentKey shape: whatseek.chat.reply.<key-or-dotted-path>
  const key = reply.contentKey.replace('whatseek.chat.reply.', '');
  const entry = resolveReplyEntry(key);
  if (entry === undefined) {
    return reply.contentKey;
  }
  return interpolateReply(entry[chatLocale], reply.contentParams);
}

export function toCardView(cards: ChatReply['cards']): ChatCardView | null {
  if (cards === undefined || cards.length === 0) {
    return null;
  }
  const view: ChatCardView = { type: cards[0]!.type, apps: [], plan: null, sendMessage: null, commerce: null, contacts: [] };
  for (const card of cards) {
    if (card.type === 'app_results') {
      for (const { app, reason } of card.apps) {
        view.apps.push({ id: app.id, name: app.name, summary: app.summary, priceLabel: app.priceLabel, reason, aiCapability: app.aiCapability });
      }
    } else if (card.type === 'app_plan') {
      view.plan = { title: card.title, modules: [...card.modules], requirement: card.requirement };
    } else if (card.type === 'send_message_confirm') {
      view.sendMessage = { contactId: card.contactId, contactName: contactNameOf(card), draft: card.draft };
    } else if (card.type === 'commerce_results') {
      view.commerce = { domain: card.domain, items: card.items.map((item) => ({ ...item })) };
    } else if (card.type === 'contact_results') {
      for (const contact of card.contacts) {
        view.contacts.push({ id: contact.id, name: contact.name, bio: contact.bio });
      }
    }
  }
  return view;
}

function contactNameOf(card: Extract<ChatCard, { type: 'send_message_confirm' }>): string {
  return card.contactName;
}

export async function sendChatTurn(text: string): Promise<{ replyText: string; cards: ChatCardView | null; taskId?: string }> {
  const chat = getWhatseekClient('chat');
  const reply = await chat.handleSend(text);
  return { replyText: replyText(reply), cards: toCardView(reply.cards), taskId: reply.taskId };
}

export async function runCardAction(action: ChatCardAction): Promise<string> {
  const chat = getWhatseekClient('chat');
  const outcome = await chat.runCardAction(action);
  return replyText({ contentKey: outcome.message, contentParams: outcome.messageParams });
}

export async function taskStatus(taskId: string): Promise<{ id: string; title: string; state: string; resultSummary?: string } | null> {
  const task = await getWhatseekClient('tasks').getTask(taskId);
  if (task === null) {
    return null;
  }
  return { id: task.id, title: task.title, state: task.state, resultSummary: task.resultSummary };
}
