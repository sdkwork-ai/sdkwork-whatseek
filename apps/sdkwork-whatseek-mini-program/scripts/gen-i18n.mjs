// One-shot generator: i18n fragments for the mini-program capability packages
// (APP_MINI_PROGRAM_UI_SPEC §i18n layout:
//  src/i18n/<locale>/<domain>/<capability>/<fragment>.json).
// Run from apps/sdkwork-whatseek-mini-program: node scripts/gen-i18n.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const base = path.join(process.cwd(), 'packages');

const FRAGMENTS = {
  core: { host: { bootstrapDone: '运行时已就绪' } },
  commons: { task: { pending: '排队中', running: '执行中', completed: '已完成', failed: '失败' } },
  shell: { tab: { chat: '对话', apps: '应用', contacts: '通讯录', messages: '消息', profile: '我的' } },
  chat: {
    reply: {
      searchAppFound: '找到适合你的应用：',
      searchAppNotFoundCreate: '没有找到现成的应用 —— 我可以直接帮你创建一个：',
      createAppPlan: '好的，我准备创建，方案如下：',
      sendMessageConfirm: '我找到了联系人，发送前请确认：',
      sendMessageContactNotFound: '通讯录里没有找到这个联系人。',
      searchPersonFound: '找到这些联系人：',
      searchPersonNotFound: '没有找到相关联系人。',
      searchSupplier: '为你找到这些供应商（商业生态预览）：',
      commercePreview: '商业生态预览（Phase 2 接入完整供需网络）：',
      createContentAccepted: '收到！任务已完成。',
      searchAgent: { found: '找到这些 Agent / 智能体：', notFound: '暂时没有匹配的 Agent。你可以描述需求，后续版本可以直接创建。' },
      useAgent: { found: '可以派这些 Agent 帮你执行：' },
      createAgent: { recommend: '创建数字员工将在后续版本开放，先用现成的 Agent 试试：' },
      task: { accepted: '收到！任务已开始，完成后我会通知你。' },
      general: '我是问寻 AI。你可以让我找应用、创建应用、找供应商，或者联系某人——直接说就行。',
      error: '出了点问题，请重试。',
      actionAppGenerated: '已生成应用「{name}」，可以在「我的应用」中查看。',
      actionMessageSent: '消息已发送，可以在「消息」中继续对话。',
      actionNavigated: '好的。',
    },
  },
  apps: { home: { title: '应用中心', searchPlaceholder: '搜索应用，或者直接告诉我你要做什么' }, detail: { use: '立即使用' } },
  contacts: { home: { title: '通讯录' }, detail: { sendMessage: '发消息' } },
  messages: { home: { title: '消息', subtitle: '私聊、通知与 AI 任务事件都在这里' }, kind: { system: '系统通知', app: '应用通知', task: 'AI 任务' } },
  profile: { home: { title: '我的', visitor: '访客', brand: '你负责问，AI 负责寻', agents: 'Agent' } },
};

const EN = {
  core: { host: { bootstrapDone: 'Runtime ready' } },
  commons: { task: { pending: 'Pending', running: 'Running', completed: 'Completed', failed: 'Failed' } },
  shell: { tab: { chat: 'Chat', apps: 'Apps', contacts: 'Contacts', messages: 'Messages', profile: 'Me' } },
  chat: {
    reply: {
      searchAppFound: 'I found apps that fit:',
      searchAppNotFoundCreate: 'No existing app matched — I can create one for you:',
      createAppPlan: 'Sure, here is the plan:',
      sendMessageConfirm: 'I found the contact. Please confirm before sending:',
      sendMessageContactNotFound: 'I could not find that contact.',
      searchPersonFound: 'Found these contacts:',
      searchPersonNotFound: 'No matching contacts.',
      searchSupplier: 'Here are matching suppliers (commerce preview):',
      commercePreview: 'Commerce preview (full supply-demand network arrives in Phase 2):',
      createContentAccepted: 'Got it! The task completed.',
      searchAgent: { found: 'Here are the matching agents:', notFound: 'No matching agent yet. Describe what you need — creation arrives in a later release.' },
      useAgent: { found: 'These agents can take this on for you:' },
      createAgent: { recommend: 'Agent creation opens in a later release — try an existing one for now:' },
      task: { accepted: 'Got it! The task has started; I will notify you when it completes.' },
      general: 'I am WhatSeek AI. Ask me to find apps, create apps, find suppliers, or reach someone.',
      error: 'Something went wrong. Please retry.',
      actionAppGenerated: 'Generated app "{name}" — see it under My apps.',
      actionMessageSent: 'Message sent — continue the conversation in Messages.',
      actionNavigated: 'Done.',
    },
  },
  apps: { home: { title: 'App Center', searchPlaceholder: 'Search apps, or just tell me what you need' }, detail: { use: 'Use now' } },
  contacts: { home: { title: 'Contacts' }, detail: { sendMessage: 'Message' } },
  messages: { home: { title: 'Messages', subtitle: 'Chats, notifications, and AI task events in one place' }, kind: { system: 'System', app: 'App', task: 'AI task' } },
  profile: { home: { title: 'Me', visitor: 'Visitor', brand: 'You ask, AI seeks', agents: 'Agents' } },
};

for (const [pkg, zh] of Object.entries(FRAGMENTS)) {
  for (const [locale, data] of [['zh-CN', zh], ['en-US', EN[pkg]]]) {
    const dir = path.join(base, `sdkwork-whatseek-mp-${pkg}`, 'src', 'i18n', locale, 'whatseek', pkg);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'strings.json'), JSON.stringify(data, null, 2) + '\n');
  }
  console.log('i18n', pkg);
}
console.log('mp i18n fragments written');
