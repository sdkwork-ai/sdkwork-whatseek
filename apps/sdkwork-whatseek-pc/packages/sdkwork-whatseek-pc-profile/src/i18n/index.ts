/**
 * i18n fragments for the profile capability (I18N_SPEC.md §6 layout).
 */

import enUsProfileScreens from './en-US/whatseek/profile/screens.json';
import zhCnProfileScreens from './zh-CN/whatseek/profile/screens.json';

import type { WhatseekLocaleResources } from '@sdkwork/whatseek-pc-core';

export const profileI18nResources: WhatseekLocaleResources = {
  'zh-CN': { whatseek: { profile: zhCnProfileScreens } },
  'en-US': { whatseek: { profile: enUsProfileScreens } },
};
