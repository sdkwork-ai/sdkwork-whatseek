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
  apps: { id: string; name: string; summary: string; priceLabel: string; reason: string }[];
  plan: { title: string; modules: string[]; requirement: string } | null;
  sendMessage: { contactId: string; contactName: string; draft: string } | null;
  commerce: { domain: string; items: { id: string; title: string; subtitle: string; priceLabel: string }[] } | null;
  contacts: { id: string; name: string; bio: string }[];
}

type ReplyKeys = keyof typeof zhReplies.reply;

const REPLY_TEXT: Record<Exclude<ReplyKeys, 'tab'>, Record<'zh-CN' | 'en-US', string>> = {
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
  actionNavigated: { 'zh-CN': zhReplies.reply.actionNavigated, 'en-US': enReplies.reply.actionNavigated },
};

let chatLocale: 'zh-CN' | 'en-US' = 'zh-CN';

export function setChatLocale(locale: 'zh-CN' | 'en-US'): void {
  chatLocale = locale;
}

export function replyText(reply: Pick<ChatReply, 'contentKey'>): string {
  // contentKey shape: whatseek.chat.reply.<key>
  const key = reply.contentKey.replace('whatseek.chat.reply.', '') as ReplyKeys;
  const entry = REPLY_TEXT[key as Exclude<ReplyKeys, 'tab'>];
  return entry !== undefined ? entry[chatLocale] : reply.contentKey;
}

export function toCardView(cards: ChatReply['cards']): ChatCardView | null {
  if (cards === undefined || cards.length === 0) {
    return null;
  }
  const view: ChatCardView = { type: cards[0]!.type, apps: [], plan: null, sendMessage: null, commerce: null, contacts: [] };
  for (const card of cards) {
    if (card.type === 'app_results') {
      for (const { app, reason } of card.apps) {
        view.apps.push({ id: app.id, name: app.name, summary: app.summary, priceLabel: app.priceLabel, reason });
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
  return replyText({ contentKey: outcome.message });
}
