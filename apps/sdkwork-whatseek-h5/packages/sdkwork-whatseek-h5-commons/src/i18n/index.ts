/**
 * i18n fragments for the commons package (I18N_SPEC.md §6 layout:
 * `src/i18n/<locale>/<domain>/<capability>/<fragment>.json`).
 */

import enUsCommons from './en-US/whatseek/commons/commons.json';
import zhCnCommons from './zh-CN/whatseek/commons/commons.json';

import type { WhatseekLocaleResources } from '@sdkwork/whatseek-h5-core';

export const commonsI18nResources: WhatseekLocaleResources = {
  'zh-CN': { whatseek: { commons: zhCnCommons } },
  'en-US': { whatseek: { commons: enUsCommons } },
};
