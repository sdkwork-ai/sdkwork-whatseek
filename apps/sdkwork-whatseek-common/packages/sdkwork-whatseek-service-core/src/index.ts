/**
 * Public export boundary of `@sdkwork/whatseek-service-core` — the shared
 * WhatSeek domain model, SDK ports, SDK adapter boundaries, client registry,
 * and mock client implementations (APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md:
 * contracts, service ports, and SDK adapter boundaries live in the common
 * family; UI stays in the surfaces).
 */

export type {
  AppCategory,
  AppChartId,
  AppChartPreview,
  AppCollection,
  AppCollectionCard,
  AppCollectionKind,
  AppHeroSlide,
  AppHomeFeed,
  AppRecommendation,
  AppStoryCard,
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
  SessionUser,
  TaskState,
  WhatseekApp,
  WhatseekAppKind,
  WhatseekTask,
} from './types.js';

export type { TabId } from '@sdkwork/whatseek-route-core';
export type { IntentResult, WhatseekIntent } from '@sdkwork/whatseek-intent-core';

export type {
  AppsPort,
  ChatActionOutcome,
  ChatCardAction,
  ChatPort,
  ContactsPort,
  MessagesPort,
  MessagesPortEvents,
  TasksPort,
  WhatseekPortMap,
  WhatseekPortName,
} from './ports.js';
export {
  getWhatseekClient,
  hasWhatseekClient,
  registerWhatseekClient,
  resetWhatseekClients,
} from './inventory.js';

export { createMockAppsClient, type MockAppsClientOptions } from './apps/appsClient.js';
export { extractSearchKeywords, scoreAppForKeywords, type ScoredApp, type WhatseekAppLike } from './apps/search.js';
export {
  WHATSEEK_CATALOG,
  WHATSEEK_CATEGORIES,
  DEFAULT_CREATION_MODULES,
  planModulesForRequirement,
} from './apps/catalog.js';
export {
  WHATSEEK_HOME_COLLECTIONS,
  WHATSEEK_HOME_HEROES,
  WHATSEEK_HOME_STORIES,
  buildWhatseekHomeFeed,
  findWhatseekCollection,
  listWhatseekChartApps,
  listWhatseekCollectionApps,
} from './apps/homeFeed.js';

export { createMockContactsClient, CONTACT_KIND_ORDER, type MockContactsClientOptions } from './contacts/contactsClient.js';

export { conversationKindGlyph, createMockMessagesClient, type MockMessagesClientOptions } from './messages/messagesClient.js';

export { createMockChatClient, type MockChatClientDeps, type MockChatClientOptions, type Scheduler } from './chat/chatClient.js';
export { createMockTasksClient, type MockTasksClientOptions } from './chat/tasksClient.js';

// SDK adapter boundaries (APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md: the
// common family owns the SDK adapter mapping; each surface's bootstrap
// composition root constructs the composed SDK clients and injects gateway
// slices). Surface capability packages re-export these under their own names.
export {
  createImMessagesClient,
  type ImMessagesClientOptions,
  type ImMessagesGateway,
} from './sdk/imMessagesClient.js';
export {
  createImContactsClient,
  type ImContactsClientOptions,
  type ImContactsGateway,
} from './sdk/imContactsClient.js';
export {
  createAppstoreAppsClient,
  type AppstoreAppsClientOptions,
  type AppstoreCatalogGateway,
} from './sdk/appstoreAppsClient.js';
