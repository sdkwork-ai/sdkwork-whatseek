/**
 * Public export boundary of `@sdkwork/whatseek-h5-core`
 * (TYPESCRIPT_CODE_SPEC.md §8: this file is the package's only public surface).
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
  IntentResult,
  SessionUser,
  TabId,
  TaskState,
  WhatseekApp,
  WhatseekAppKind,
  WhatseekIntent,
  WhatseekTask,
} from './types.js';

export type {
  ChatActionOutcome,
  ChatCardAction,
  AppsPort,
  ChatPort,
  ContactsPort,
  MessagesPort,
  TasksPort,
} from './sdk/ports.js';
export {
  getWhatseekClient,
  hasWhatseekClient,
  registerWhatseekClient,
  resetWhatseekClients,
} from './sdk/inventory.js';

export type { WhatseekRouteIdentity, WhatseekRouteIssue } from './routes/identity.js';
export {
  composeWhatseekRouteTable,
  defineWhatseekRoutes,
  findTabRoute,
  partitionWhatseekRouteTable,
  routeIdentitiesForTest,
  validateWhatseekRouteTable,
} from './routes/identity.js';
export { WHATSEEK_TABS, type TabDefinition } from './routes/tabs.js';

export { getCurrentUser, useSessionStore } from './session/authState.js';
export { useTabBadgeStore } from './state/badgeStore.js';

export type { ColorMode } from './theme/colorMode.js';
export {
  COLOR_MODE_STORAGE_KEY,
  applyColorMode,
  readAppliedColorMode,
  readStoredColorMode,
  toggleColorMode,
} from './theme/colorMode.js';

export type { WhatseekLocale, WhatseekLocaleResources } from './i18n/createWhatseekI18n.js';
export {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  WHATSEEK_LOCALES,
  changeWhatseekLocale,
  createWhatseekI18n,
  getWhatseekI18n,
  mergeWhatseekResources,
  persistLocale,
  readStoredLocale,
} from './i18n/createWhatseekI18n.js';

export type { WhatseekRuntimeEnvironment } from './environment/runtimeEnvironment.js';
export {
  FALLBACK_RUNTIME_ENVIRONMENT,
  loadRuntimeEnvironment,
} from './environment/runtimeEnvironment.js';
