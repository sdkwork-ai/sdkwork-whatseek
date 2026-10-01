/**
 * Public export boundary of `@sdkwork/whatseek-h5-messages`.
 */

export { messagesRouteContributions } from './routes/routeContributions.js';
export { messagesI18nResources } from './i18n/index.js';
export { createMockMessagesClient, conversationKindGlyph, type MockMessagesClientOptions } from './services/messagesClient.js';
export { MessagesHomeScreen } from './screens/MessagesHomeScreen.js';
export { ConversationScreen } from './screens/ConversationScreen.js';
