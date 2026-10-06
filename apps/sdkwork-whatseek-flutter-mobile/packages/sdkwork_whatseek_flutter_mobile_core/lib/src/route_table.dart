/// Route identity contract for the Flutter surface.
///
/// Route ids are the cross-surface contract (H5/PC/mini-program/Flutter):
/// `<surface>.<domain>.<capability>.<screen>`, aligned with
/// `@sdkwork/whatseek-route-core`.
library;

/// Bottom navigation vocabulary (PRD §7).
enum TabId { chat, apps, contacts, messages, profile }

/// One route identity in the aligned cross-surface table.
class WhatseekRouteIdentity {
  const WhatseekRouteIdentity({
    required this.id,
    required this.path,
    required this.titleKey,
    required this.capability,
    required this.tab,
  });

  final String id;
  final String path;
  final String titleKey;
  final String capability;
  final TabId? tab;
}

/// The five tab roots, in PRD order.
const List<WhatseekRouteIdentity> kTabRootRoutes = [
  WhatseekRouteIdentity(
    id: 'app.whatseek.chat.home',
    path: '/chat',
    titleKey: 'whatseek.chat.home.title',
    capability: 'chat',
    tab: TabId.chat,
  ),
  WhatseekRouteIdentity(
    id: 'app.whatseek.apps.home',
    path: '/apps',
    titleKey: 'whatseek.apps.home.title',
    capability: 'apps',
    tab: TabId.apps,
  ),
  WhatseekRouteIdentity(
    id: 'app.whatseek.contacts.home',
    path: '/contacts',
    titleKey: 'whatseek.contacts.home.title',
    capability: 'contacts',
    tab: TabId.contacts,
  ),
  WhatseekRouteIdentity(
    id: 'app.whatseek.messages.home',
    path: '/messages',
    titleKey: 'whatseek.messages.home.title',
    capability: 'messages',
    tab: TabId.messages,
  ),
  WhatseekRouteIdentity(
    id: 'app.whatseek.profile.home',
    path: '/profile',
    titleKey: 'whatseek.profile.home.title',
    capability: 'profile',
    tab: TabId.profile,
  ),
];

/// Secondary routes (detail screens), aligned with the other surfaces.
const List<WhatseekRouteIdentity> kSecondaryRoutes = [
  WhatseekRouteIdentity(
    id: 'app.whatseek.apps.search',
    path: '/apps/search',
    titleKey: 'whatseek.apps.search.title',
    capability: 'apps',
    tab: null,
  ),
  WhatseekRouteIdentity(
    id: 'app.whatseek.apps.detail',
    path: '/apps/detail',
    titleKey: 'whatseek.apps.detail.title',
    capability: 'apps',
    tab: null,
  ),
  WhatseekRouteIdentity(
    id: 'app.whatseek.apps.charts',
    path: '/apps/charts',
    titleKey: 'whatseek.apps.charts.title',
    capability: 'apps',
    tab: null,
  ),
  WhatseekRouteIdentity(
    id: 'app.whatseek.apps.collection',
    path: '/apps/collection',
    titleKey: 'whatseek.apps.collection.title',
    capability: 'apps',
    tab: null,
  ),
  WhatseekRouteIdentity(
    id: 'app.whatseek.apps.runner',
    path: '/apps/runner',
    titleKey: 'whatseek.apps.runner.title',
    capability: 'apps',
    tab: null,
  ),
  WhatseekRouteIdentity(
    id: 'app.whatseek.apps.create',
    path: '/apps/create',
    titleKey: 'whatseek.apps.create.title',
    capability: 'apps',
    tab: null,
  ),
  WhatseekRouteIdentity(
    id: 'app.whatseek.apps.my',
    path: '/apps/my',
    titleKey: 'whatseek.apps.my.title',
    capability: 'apps',
    tab: null,
  ),
  WhatseekRouteIdentity(
    id: 'app.whatseek.contacts.detail',
    path: '/contacts/detail',
    titleKey: 'whatseek.contacts.detail.title',
    capability: 'contacts',
    tab: null,
  ),
  WhatseekRouteIdentity(
    id: 'app.whatseek.messages.conversation',
    path: '/messages/conversation',
    titleKey: 'whatseek.messages.conversation.title',
    capability: 'messages',
    tab: null,
  ),
  WhatseekRouteIdentity(
    id: 'app.whatseek.profile.settings',
    path: '/settings',
    titleKey: 'whatseek.profile.settings.title',
    capability: 'profile',
    tab: null,
  ),
];

/// The composed cross-surface route table (15 identities).
const List<WhatseekRouteIdentity> kWhatseekRouteTable = [
  ...kTabRootRoutes,
  ...kSecondaryRoutes,
];

/// All route ids, for the cross-surface alignment test.
List<String> listWhatseekRouteIdentities() =>
    kWhatseekRouteTable.map((route) => route.id).toList();

/// Route ids exactly as the TS surfaces declare them (alignment expectation).
const List<String> kCrossSurfaceRouteIds = [
  'app.whatseek.chat.home',
  'app.whatseek.apps.home',
  'app.whatseek.apps.search',
  'app.whatseek.apps.detail',
  'app.whatseek.apps.charts',
  'app.whatseek.apps.collection',
  'app.whatseek.apps.runner',
  'app.whatseek.apps.create',
  'app.whatseek.apps.my',
  'app.whatseek.contacts.home',
  'app.whatseek.contacts.detail',
  'app.whatseek.messages.home',
  'app.whatseek.messages.conversation',
  'app.whatseek.profile.home',
  'app.whatseek.profile.settings',
];
