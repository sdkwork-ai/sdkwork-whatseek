// One-shot generator: i18n fragments for the Flutter capability packages
// (APP_FLUTTER_UI_SPEC §i18n layout:
//  lib/src/i18n/<locale>/<domain>/<capability>/<fragment>.json).
// Run from apps/sdkwork-whatseek-flutter-mobile: node scripts/gen-i18n.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const base = path.join(process.cwd(), 'packages');

const FRAGMENTS = {
  core: { shell: { tab: { chat: '对话', apps: '应用', contacts: '通讯录', messages: '消息', profile: '我的' } } },
  commons: { state: { loading: '加载中…', empty: '这里还空空如也', error: '出错了', permissionDenied: '没有权限', retry: '重试' } },
  shell: { nav: { brand: 'WhatSeek 问寻' } },
  chat: {
    home: { heroTitle: '你想做什么？', heroSubtitle: '告诉我就可以。', composerHint: '输入消息……', thinking: '问寻正在思考…', newTopic: '开始新对话' },
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
      general: '我是问寻 AI。你可以让我找应用、创建应用、找供应商，或者联系某人——直接说就行。',
      error: '出了点问题，请重试。',
      actionAppGenerated: '已生成应用「{name}」，可以在「我的应用」中查看。',
      actionMessageSent: '消息已发送，可以在「消息」中继续对话。',
      actionNavigated: '好的。',
    },
  },
  apps: {
    home: { title: '应用中心', searchHint: '搜索应用，或者直接告诉我你要做什么', empty: '没有找到合适的应用' },
    detail: { use: '立即使用', createFrom: '基于此创建' },
    my: { title: '我的应用', emptyTitle: '还没有创建应用', emptyHint: '用一句自然语言，让 AI 帮你生成第一个应用' },
    create: { title: 'AI 创建应用', plan: '生成方案', generate: '直接生成', publish: '发布到我的应用', published: '已发布！应用已保存到「我的应用」。' },
  },
  contacts: { home: { title: '通讯录' }, detail: { company: '公司', sendMessage: '发消息' } },
  messages: { home: { title: '消息', subtitle: '私聊、通知与 AI 任务事件都在这里' }, conversation: { composerHint: '输入消息……', send: '发送' } },
  profile: { home: { title: '我的', visitor: '访客', visitorHint: '登录后同步你的数字资产', myApps: '我的应用', favorites: '收藏', brand: '你负责问，AI 负责寻' } },
};

const EN = {
  core: { shell: { tab: { chat: 'Chat', apps: 'Apps', contacts: 'Contacts', messages: 'Messages', profile: 'Me' } } },
  commons: { state: { loading: 'Loading…', empty: 'Nothing here yet', error: 'Something went wrong', permissionDenied: 'Permission denied', retry: 'Retry' } },
  shell: { nav: { brand: 'WhatSeek' } },
  chat: {
    home: { heroTitle: 'What do you want to do?', heroSubtitle: 'Just tell me.', composerHint: 'Type a message…', thinking: 'WhatSeek is thinking…', newTopic: 'Start a new chat' },
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
      general: 'I am WhatSeek AI. Ask me to find apps, create apps, find suppliers, or reach someone.',
      error: 'Something went wrong. Please retry.',
      actionAppGenerated: 'Generated app "{name}" — see it under My apps.',
      actionMessageSent: 'Message sent — continue the conversation in Messages.',
      actionNavigated: 'Done.',
    },
  },
  apps: {
    home: { title: 'App Center', searchHint: 'Search apps, or just tell me what you need', empty: 'No suitable app found' },
    detail: { use: 'Use now', createFrom: 'Create from this' },
    my: { title: 'My apps', emptyTitle: 'No apps created yet', emptyHint: 'Use one sentence and let AI generate your first app' },
    create: { title: 'AI app creation', plan: 'Generate plan', generate: 'Generate now', publish: 'Publish to My apps', published: 'Published! The app is saved under "My apps".' },
  },
  contacts: { home: { title: 'Contacts' }, detail: { company: 'Company', sendMessage: 'Message' } },
  messages: { home: { title: 'Messages', subtitle: 'Chats, notifications, and AI task events in one place' }, conversation: { composerHint: 'Type a message…', send: 'Send' } },
  profile: { home: { title: 'Me', visitor: 'Visitor', visitorHint: 'Sign in to sync your digital assets', myApps: 'My apps', favorites: 'Favorites', brand: 'You ask, AI seeks' } },
};

for (const [pkg, zh] of Object.entries(FRAGMENTS)) {
  for (const [locale, data] of [['zh-CN', zh], ['en-US', EN[pkg]]]) {
    const dir = path.join(
      base,
      ['sdkwork_whatseek_flutter_mobile', pkg].join('_'),
      'lib', 'src', 'i18n', locale, 'whatseek', pkg,
    );
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'strings.json'), JSON.stringify(data, null, 2) + '\n');
  }
  console.log('i18n', pkg);
}
console.log('flutter i18n fragments written');
