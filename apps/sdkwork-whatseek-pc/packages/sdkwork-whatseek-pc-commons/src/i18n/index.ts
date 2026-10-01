/**
 * i18n fragments for the pc-commons package (I18N_SPEC.md §6 layout).
 */

import enUsPcCommons from './en-US/whatseek/commons/commons.json';
import zhCnPcCommons from './zh-CN/whatseek/commons/commons.json';

import type { WhatseekLocaleResources } from '@sdkwork/whatseek-pc-core';

export const commonsI18nResources: WhatseekLocaleResources = {
  'zh-CN': { whatseek: { commons: zhCnPcCommons } },
  'en-US': { whatseek: { commons: enUsPcCommons } },
};
