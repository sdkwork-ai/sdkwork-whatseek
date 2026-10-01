/**
 * Public export boundary of `@sdkwork/whatseek-h5-chat`.
 */

export { chatRouteContributions } from './routes/routeContributions.js';
export { chatI18nResources } from './i18n/index.js';
export { recognizeIntent } from './intent/recognizer.js';
export { createMockChatClient, type MockChatClientDeps, type MockChatClientOptions } from './services/chatClient.js';
export { createMockTasksClient, type MockTasksClientOptions } from './services/tasksClient.js';
export { ChatHomeScreen } from './screens/ChatHomeScreen.js';
export { ChatCardView, type ChatCardViewProps } from './components/ChatCardView.js';
export { TaskChip } from './components/TaskChip.js';
export { useChatTurn } from './hooks/useChatTurn.js';
export { useChatStore, type ChatEntry, type ChatThread } from './state/chatStore.js';
