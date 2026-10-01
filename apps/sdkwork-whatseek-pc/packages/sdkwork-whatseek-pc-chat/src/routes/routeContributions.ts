import { defineWhatseekRoutes } from '@sdkwork/whatseek-pc-core';

import type { WhatseekRouteIdentity } from '@sdkwork/whatseek-pc-core';

/** Route contributions of the chat capability; owns the 对话 tab root. */
export const chatRouteContributions = defineWhatseekRoutes([
  {
    id: 'app.whatseek.chat.home',
    path: '/chat',
    titleKey: 'whatseek.chat.home.title',
    capability: 'chat',
    tab: 'chat',
  },
] satisfies readonly WhatseekRouteIdentity[]);
