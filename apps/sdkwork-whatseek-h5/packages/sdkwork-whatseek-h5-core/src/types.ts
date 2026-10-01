/**
 * Shared domain model for the WhatSeek (问寻) super app — ownership lives in
 * `@sdkwork/whatseek-service-core` (APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md);
 * this module re-exports it so the h5-core public surface stays stable.
 */

export type {
  AppCategory,
  AppRecommendation,
  ChatCard,
  ChatMessage,
  CommerceResult,
  Contact,
  ContactKind,
  Conversation,
  ConversationKind,
  CreatedApp,
  CreatedAppLifecycle,
  ChatReply,
  IntentResult,
  SessionUser,
  TaskState,
  WhatseekApp,
  WhatseekAppKind,
  WhatseekIntent,
  WhatseekTask,
} from '@sdkwork/whatseek-service-core';
export type { TabId } from '@sdkwork/whatseek-route-core';
