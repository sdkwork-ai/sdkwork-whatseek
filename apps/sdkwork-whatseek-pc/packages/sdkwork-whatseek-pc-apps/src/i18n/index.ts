/**
 * i18n fragments for the apps capability (I18N_SPEC.md §6 layout).
 */

import enUsAppsScreens from './en-US/whatseek/apps/screens.json';
import zhCnAppsScreens from './zh-CN/whatseek/apps/screens.json';

import type { WhatseekLocaleResources } from '@sdkwork/whatseek-pc-core';

export const appsI18nResources: WhatseekLocaleResources = {
  'zh-CN': { whatseek: { apps: zhCnAppsScreens } },
  'en-US': { whatseek: { apps: enUsAppsScreens } },
};
