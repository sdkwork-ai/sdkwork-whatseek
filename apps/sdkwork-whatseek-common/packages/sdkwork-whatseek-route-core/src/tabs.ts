/**
 * Bottom navigation contract: exactly five tabs, Chat first
 * (PRD §7/§54: 对话｜应用｜通讯录｜消息｜我的).
 */

import type { TabId } from './types.js';

export interface TabDefinition {
  id: TabId;
  /** Tab root route path. */
  path: string;
  /** i18n key of the tab label. */
  titleKey: string;
}

export const WHATSEEK_TABS: readonly TabDefinition[] = [
  { id: 'chat', path: '/chat', titleKey: 'whatseek.shell.tab.chat' },
  { id: 'apps', path: '/apps', titleKey: 'whatseek.shell.tab.apps' },
  { id: 'contacts', path: '/contacts', titleKey: 'whatseek.shell.tab.contacts' },
  { id: 'messages', path: '/messages', titleKey: 'whatseek.shell.tab.messages' },
  { id: 'profile', path: '/profile', titleKey: 'whatseek.shell.tab.profile' },
] as const;
