import { defineWhatseekRoutes } from '@sdkwork/whatseek-pc-core';

import type { WhatseekRouteIdentity } from '@sdkwork/whatseek-pc-core';

/** Route contributions of the messages capability; owns the messages tab root. */
export const messagesRouteContributions = defineWhatseekRoutes([
  {
    id: "app.whatseek.messages.home",
    path: "/messages",
    titleKey: "whatseek.messages.home.title",
    capability: "messages",
    tab: "messages",
  },
  {
    id: "app.whatseek.messages.conversation",
    path: "/messages/c/:conversationId",
    titleKey: "whatseek.messages.conversation.title",
    capability: "messages",
    tab: null,
  },
] satisfies readonly WhatseekRouteIdentity[]);
