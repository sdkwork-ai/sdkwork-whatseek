/**
 * Public export boundary of `@sdkwork/whatseek-pc-contacts`.
 */

export { contactsRouteContributions } from './routes/routeContributions.js';
export { contactsI18nResources } from './i18n/index.js';
export { createMockContactsClient, CONTACT_KIND_ORDER, type MockContactsClientOptions } from './services/contactsClient.js';
export { createImContactsClient, type ImContactsClientOptions, type ImContactsGateway } from './services/imContactsClient.js';
export { ContactsHomeScreen } from './screens/ContactsHomeScreen.js';
export { ContactDetailScreen } from './screens/ContactDetailScreen.js';
export { useContactsData, type ContactSegment } from './hooks/useContactsData.js';
