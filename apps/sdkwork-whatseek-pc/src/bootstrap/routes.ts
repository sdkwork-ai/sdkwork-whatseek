/**
 * Route composition (APP_PC_ARCHITECTURE_SPEC.md): capability contributions →
 * canonical route table → element map. Route ids are the same cross-surface
 * contract as H5/mini-program/Flutter.
 */

import { lazy } from 'react';

import { composeWhatseekRouteTable } from '@sdkwork/whatseek-pc-core';
import type { WhatseekRouteIdentity } from '@sdkwork/whatseek-pc-core';

import { appsRouteContributions } from '@sdkwork/whatseek-pc-apps';
import { chatRouteContributions } from '@sdkwork/whatseek-pc-chat';
import { contactsRouteContributions } from '@sdkwork/whatseek-pc-contacts';
import { messagesRouteContributions } from '@sdkwork/whatseek-pc-messages';
import { profileRouteContributions } from '@sdkwork/whatseek-pc-profile';

export const whatseekPcRouteTable: readonly WhatseekRouteIdentity[] = composeWhatseekRouteTable([
  chatRouteContributions,
  appsRouteContributions,
  contactsRouteContributions,
  messagesRouteContributions,
  profileRouteContributions,
]);

export function listWhatseekPcRouteIdentities(): string[] {
  return whatseekPcRouteTable.map((route) => route.id);
}

/** Route id → lazily loaded screen element (kept in sync with App.tsx). */
export const whatseekPcRouteElements: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'app.whatseek.chat.home': lazy(() =>
    import('@sdkwork/whatseek-pc-chat').then((module) => ({ default: module.ChatHomeScreen })),
  ),
  'app.whatseek.apps.home': lazy(() =>
    import('@sdkwork/whatseek-pc-apps').then((module) => ({ default: module.AppsHomeScreen })),
  ),
  'app.whatseek.apps.search': lazy(() =>
    import('@sdkwork/whatseek-pc-apps').then((module) => ({ default: module.AppSearchScreen })),
  ),
  'app.whatseek.apps.detail': lazy(() =>
    import('@sdkwork/whatseek-pc-apps').then((module) => ({ default: module.AppDetailScreen })),
  ),
  'app.whatseek.apps.charts': lazy(() =>
    import('@sdkwork/whatseek-pc-apps').then((module) => ({ default: module.AppChartsScreen })),
  ),
  'app.whatseek.apps.collection': lazy(() =>
    import('@sdkwork/whatseek-pc-apps').then((module) => ({ default: module.AppCollectionScreen })),
  ),
  'app.whatseek.apps.runner': lazy(() =>
    import('@sdkwork/whatseek-pc-apps').then((module) => ({ default: module.AppRunnerScreen })),
  ),
  'app.whatseek.apps.create': lazy(() =>
    import('@sdkwork/whatseek-pc-apps').then((module) => ({ default: module.AppCreateScreen })),
  ),
  'app.whatseek.apps.my': lazy(() =>
    import('@sdkwork/whatseek-pc-apps').then((module) => ({ default: module.MyAppsScreen })),
  ),
  'app.whatseek.contacts.home': lazy(() =>
    import('@sdkwork/whatseek-pc-contacts').then((module) => ({ default: module.ContactsHomeScreen })),
  ),
  'app.whatseek.contacts.detail': lazy(() =>
    import('@sdkwork/whatseek-pc-contacts').then((module) => ({ default: module.ContactDetailScreen })),
  ),
  'app.whatseek.messages.home': lazy(() =>
    import('@sdkwork/whatseek-pc-messages').then((module) => ({ default: module.MessagesHomeScreen })),
  ),
  'app.whatseek.messages.conversation': lazy(() =>
    import('@sdkwork/whatseek-pc-messages').then((module) => ({ default: module.ConversationScreen })),
  ),
  'app.whatseek.profile.home': lazy(() =>
    import('@sdkwork/whatseek-pc-profile').then((module) => ({ default: module.ProfileHomeScreen })),
  ),
  'app.whatseek.profile.settings': lazy(() =>
    import('@sdkwork/whatseek-pc-profile').then((module) => ({ default: module.SettingsScreen })),
  ),
};
