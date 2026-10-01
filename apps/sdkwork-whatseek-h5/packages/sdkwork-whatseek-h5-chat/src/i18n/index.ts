/**
 * i18n fragments for the chat capability (I18N_SPEC.md §6 layout).
 */

import enUsChatScreens from './en-US/whatseek/chat/screens.json';
import zhCnChatScreens from './zh-CN/whatseek/chat/screens.json';

import type { WhatseekLocaleResources } from '@sdkwork/whatseek-h5-core';

export const chatI18nResources: WhatseekLocaleResources = {
  'zh-CN': { whatseek: { chat: zhCnChatScreens } },
  'en-US': { whatseek: { chat: enUsChatScreens } },
};
