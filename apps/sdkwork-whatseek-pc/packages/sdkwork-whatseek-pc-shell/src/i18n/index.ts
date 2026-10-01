/**
 * i18n fragments for the pc-shell package (I18N_SPEC.md §6 layout).
 */

import enUsPcShellNavigation from './en-US/whatseek/shell/navigation.json';
import zhCnPcShellNavigation from './zh-CN/whatseek/shell/navigation.json';

import type { WhatseekLocaleResources } from '@sdkwork/whatseek-pc-core';

export const shellI18nResources: WhatseekLocaleResources = {
  'zh-CN': { whatseek: { shell: zhCnPcShellNavigation } },
  'en-US': { whatseek: { shell: enUsPcShellNavigation } },
};
