/**
 * i18n fragments for the shell package (I18N_SPEC.md §6 layout).
 */

import enUsShellNavigation from './en-US/whatseek/shell/navigation.json';
import zhCnShellNavigation from './zh-CN/whatseek/shell/navigation.json';

import type { WhatseekLocaleResources } from '@sdkwork/whatseek-h5-core';

export const shellI18nResources: WhatseekLocaleResources = {
  'zh-CN': { whatseek: { shell: zhCnShellNavigation } },
  'en-US': { whatseek: { shell: enUsShellNavigation } },
};
