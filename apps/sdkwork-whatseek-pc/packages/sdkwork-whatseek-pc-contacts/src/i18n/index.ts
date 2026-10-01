/**
 * i18n fragments for the contacts capability (I18N_SPEC.md §6 layout).
 */

import enUsContactsScreens from './en-US/whatseek/contacts/screens.json';
import zhCnContactsScreens from './zh-CN/whatseek/contacts/screens.json';

import type { WhatseekLocaleResources } from '@sdkwork/whatseek-pc-core';

export const contactsI18nResources: WhatseekLocaleResources = {
  'zh-CN': { whatseek: { contacts: zhCnContactsScreens } },
  'en-US': { whatseek: { contacts: enUsContactsScreens } },
};
