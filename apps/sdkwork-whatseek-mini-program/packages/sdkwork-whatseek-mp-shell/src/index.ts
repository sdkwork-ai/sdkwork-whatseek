/**
 * Public export boundary of `@sdkwork/whatseek-mp-shell` — the tabBar page
 * map and navigation titles projected from the cross-surface route identities
 * (route ids aligned with H5/PC/Flutter).
 */

import { WHATSEEK_TABS } from '@sdkwork/whatseek-route-core';

/** zh-CN tab labels for the native tabBar (PRD §7). */
export const TAB_LABELS: Record<string, string> = {
  chat: '对话',
  apps: '应用',
  contacts: '通讯录',
  messages: '消息',
  profile: '我的',
};

/** tabBar page paths relative to miniprogramRoot, in PRD order. */
export const TAB_PAGE_PATHS: readonly string[] = WHATSEEK_TABS.map((tab) => `pages/${tab.id}/index`);

/** Navigation bar titles for every projected page. */
export const PAGE_TITLES: Record<string, string> = {
  'pages/chat/index': '对话',
  'pages/apps/index': '应用中心',
  'pages/contacts/index': '通讯录',
  'pages/messages/index': '消息',
  'pages/profile/index': '我的',
  'detail/apps-detail/index': '应用详情',
  'detail/conversation/index': '会话',
};
