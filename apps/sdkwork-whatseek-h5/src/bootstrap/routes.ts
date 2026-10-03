/**
 * Route composition (APP_H5 §2 `src/bootstrap/routes.ts`): capability
 * contributions → canonical route table → element map. The route-alignment
 * test asserts every identity in the table is mounted.
 */

import { lazy } from 'react';

import { composeWhatseekRouteTable } from '@sdkwork/whatseek-h5-core';
import type { WhatseekRouteIdentity } from '@sdkwork/whatseek-h5-core';

import { appsRouteContributions } from '@sdkwork/whatseek-h5-apps';
import { chatRouteContributions } from '@sdkwork/whatseek-h5-chat';
import { contactsRouteContributions } from '@sdkwork/whatseek-h5-contacts';
import { messagesRouteContributions } from '@sdkwork/whatseek-h5-messages';
import { profileRouteContributions } from '@sdkwork/whatseek-h5-profile';

export const whatseekRouteTable: readonly WhatseekRouteIdentity[] = composeWhatseekRouteTable([
  chatRouteContributions,
  appsRouteContributions,
  contactsRouteContributions,
  messagesRouteContributions,
  profileRouteContributions,
]);

export function listWhatseekRouteIdentities(): string[] {
  return whatseekRouteTable.map((route) => route.id);
}

/** Route id → lazily loaded screen element (kept in sync with App.tsx). */
export const whatseekRouteElements: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'app.whatseek.chat.home': lazy(() =>
    import('@sdkwork/whatseek-h5-chat').then((module) => ({ default: module.ChatHomeScreen })),
  ),
  'app.whatseek.apps.home': lazy(() =>
    import('@sdkwork/whatseek-h5-apps').then((module) => ({ default: module.AppsHomeScreen })),
  ),
  'app.whatseek.apps.search': lazy(() =>
    import('@sdkwork/whatseek-h5-apps').then((module) => ({ default: module.AppSearchScreen })),
  ),
  'app.whatseek.apps.detail': lazy(() =>
    import('@sdkwork/whatseek-h5-apps').then((module) => ({ default: module.AppDetailScreen })),
  ),
  'app.whatseek.apps.charts': lazy(() =>
    import('@sdkwork/whatseek-h5-apps').then((module) => ({ default: module.AppChartsScreen })),
  ),
  'app.whatseek.apps.collection': lazy(() =>
    import('@sdkwork/whatseek-h5-apps').then((module) => ({ default: module.AppCollectionScreen })),
  ),
  'app.whatseek.apps.runner': lazy(() =>
    import('@sdkwork/whatseek-h5-apps').then((module) => ({ default: module.AppRunnerScreen })),
  ),
  'app.whatseek.apps.create': lazy(() =>
    import('@sdkwork/whatseek-h5-apps').then((module) => ({ default: module.AppCreateScreen })),
  ),
  'app.whatseek.apps.my': lazy(() =>
    import('@sdkwork/whatseek-h5-apps').then((module) => ({ default: module.MyAppsScreen })),
  ),
  'app.whatseek.contacts.home': lazy(() =>
    import('@sdkwork/whatseek-h5-contacts').then((module) => ({ default: module.ContactsHomeScreen })),
  ),
  'app.whatseek.contacts.detail': lazy(() =>
    import('@sdkwork/whatseek-h5-contacts').then((module) => ({ default: module.ContactDetailScreen })),
  ),
  'app.whatseek.messages.home': lazy(() =>
    import('@sdkwork/whatseek-h5-messages').then((module) => ({ default: module.MessagesHomeScreen })),
  ),
  'app.whatseek.messages.conversation': lazy(() =>
    import('@sdkwork/whatseek-h5-messages').then((module) => ({ default: module.ConversationScreen })),
  ),
  'app.whatseek.profile.home': lazy(() =>
    import('@sdkwork/whatseek-h5-profile').then((module) => ({ default: module.ProfileHomeScreen })),
  ),
  'app.whatseek.profile.settings': lazy(() =>
    import('@sdkwork/whatseek-h5-profile').then((module) => ({ default: module.SettingsScreen })),
  ),
};
