/**
 * i18n fragments for the messages capability (I18N_SPEC.md §6 layout).
 */

import enUsMessagesScreens from './en-US/whatseek/messages/screens.json';
import zhCnMessagesScreens from './zh-CN/whatseek/messages/screens.json';

import type { WhatseekLocaleResources } from '@sdkwork/whatseek-h5-core';

export const messagesI18nResources: WhatseekLocaleResources = {
  'zh-CN': { whatseek: { messages: zhCnMessagesScreens } },
  'en-US': { whatseek: { messages: enUsMessagesScreens } },
};
