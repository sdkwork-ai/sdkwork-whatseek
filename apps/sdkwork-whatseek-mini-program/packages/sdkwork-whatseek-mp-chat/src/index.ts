/**
 * Public export boundary of `@sdkwork/whatseek-mp-chat` — chat turn service
 * for the native chat page. Wraps the shared ChatPort: pages receive plain
 * view models, never clients.
 */

import type { ChatCardAction, ChatCard, ChatReply } from '@sdkwork/whatseek-service-core';
import { getWhatseekClient } from '@sdkwork/whatseek-service-core';

export interface ChatEntryView {
  role: 'user' | 'assistant';
  /** User turns: literal text. Assistant turns: zh text produced by the router. */
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

const zhReplyText: Record<string, string> = {
  'whatseek.chat.reply.searchApp.found': '找到适合你的应用：',
  'whatseek.chat.reply.searchApp.notFoundCreate': '没有找到现成的应用 —— 我可以直接帮你创建一个：',
  'whatseek.chat.reply.createApp.plan': '好的，我准备创建，方案如下：',
  'whatseek.chat.reply.sendMessage.confirm': '我找到了联系人，发送前请确认：',
  'whatseek.chat.reply.sendMessage.contactNotFound': '通讯录里没有找到这个联系人。',
  'whatseek.chat.reply.searchPerson.found': '找到这些联系人：',
  'whatseek.chat.reply.searchPerson.notFound': '没有找到相关联系人。',
  'whatseek.chat.reply.searchProduct': '为你找到这些商品（商业生态预览）：',
  'whatseek.chat.reply.searchSupplier': '为你找到这些供应商（商业生态预览）：',
  'whatseek.chat.reply.searchService': '为你找到这些服务（商业生态预览）：',
  'whatseek.chat.reply.createContent.accepted': '收到！任务已开始，完成后我会通知你。',
  'whatseek.chat.reply.general': '我是问寻 AI。你可以让我找应用、创建应用、找供应商，或者联系某人。',
  'whatseek.chat.reply.error': '出了点问题，请重试。',
  'whatseek.chat.reply.action.appGenerated': '应用已生成，可以在「应用 → 我的应用」中查看。',
  'whatseek.chat.reply.action.messageSent': '消息已发送，可以在「消息」中继续对话。',
  'whatseek.chat.reply.action.navigated': '好的。',
};

export function replyText(reply: Pick<ChatReply, 'contentKey'>): string {
  return zhReplyText[reply.contentKey] ?? reply.contentKey;
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
      view.sendMessage = { contactId: card.contactId, contactName: card.contactName, draft: card.draft };
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

export async function sendChatTurn(text: string): Promise<{ replyText: string; cards: ChatCardView | null; taskId?: string }> {
  const chat = getWhatseekClient('chat');
  const reply = await chat.handleSend(text);
  return { replyText: replyText(reply), cards: toCardView(reply.cards), taskId: reply.taskId };
}

export async function runCardAction(action: ChatCardAction): Promise<string> {
  const chat = getWhatseekClient('chat');
  const outcome = await chat.runCardAction(action);
  return zhReplyText[outcome.message] ?? outcome.message;
}
