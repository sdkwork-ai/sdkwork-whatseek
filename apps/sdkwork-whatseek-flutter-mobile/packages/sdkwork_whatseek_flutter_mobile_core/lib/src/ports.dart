/// Service port contracts for the WhatSeek Flutter surface — the Dart mirror
/// of the shared TS `ContactsPort`/`MessagesPort`
/// (`@sdkwork/whatseek-service-core`; the TS shapes are asserted by the
/// alignment tests). The Phase-1 mock clients implement these interfaces, and
/// the sdkwork-im adapters (in the messages/contacts capability packages) bind
/// the generated Dart IM SDK (`im_sdk_composed`) behind the same contracts, so
/// screens and the chat capability never see which driver is mounted.
library;

import 'models.dart';

/// Address book port (TS mirror: `ContactsPort`).
abstract class ContactsClient {
  Future<List<Contact>> listContacts();
  Future<List<Contact>> searchContacts(String query);
  Future<Contact?> getContact(String contactId);
}

/// Conversation inbox port (TS mirror: `MessagesPort`, pull surface). The
/// realtime conversation-changed stream rides the Phase-2 IAM session
/// coordinator, mirroring the TS `MessagesPortEvents` surface.
abstract class MessagesClient {
  Future<List<Conversation>> listConversations();
  Future<List<ChatMessage>> listMessages(String conversationId);
  Future<ChatMessage> sendMessage(String conversationId, String content);
  Future<void> markRead(String conversationId);
  Future<Conversation> openDirectConversation(String contactId);
  Future<void> postTaskNotification(WhatseekTask task);
  Future<int> unreadTotal();
}

/// App-center port (TS mirror: `AppsPort`). The home feed / catalog surface is
/// sdkwork-appstore-backed when the runtime mounts an appstore gateway;
/// whatseek-local user scope (recent, favorites, 我的应用, creation lifecycle)
/// stays whatseek-local on every driver.
abstract class AppsClient {
  Future<List<AppRecommendation>> searchApps(String query);
  /// Trending search terms for the empty-query state (catalog-seeded on the
  /// mock driver, server-side on the appstore driver).
  Future<List<String>> listTrendingSearches();
  /// Server-side search suggestions for the typed query prefix.
  Future<List<String>> listSearchSuggestions(String query);
  Future<List<WhatseekApp>> listRecommended();
  Future<List<WhatseekApp>> listHot();
  Future<AppHomeFeed> listHomeFeed();
  Future<AppCollection?> getCollection(String collectionId);
  Future<List<WhatseekApp>> listCollectionApps(String collectionId);
  Future<List<WhatseekApp>> listChart(AppChartId chartId);
  Future<List<AppCategory>> listCategories();
  Future<WhatseekApp?> getApp(String appId);
  /// Detail-enriched variant for the detail screen (store drivers hydrate
  /// whatsNew / currentVersion / screenshots; mock returns the getApp shape).
  Future<WhatseekApp?> getAppDetail(String appId);
  Future<WhatseekApp?> openApp(String appId, {bool isVisitor = false});
  Future<void> recordRecent(String appId);
  Future<List<WhatseekApp>> listRecent();
  Future<List<WhatseekApp>> listFavorites();
  Future<bool> toggleFavorite(String appId);
  Future<List<CreatedApp>> listMyApps();
  Future<CreatedApp?> getMyApp(String appId);
  Future<void> deleteMyApp(String appId);
  ({List<String> modules, List<String> pages, List<String> dataModel, String title})
      draftCreationPlan(String requirement);
  Future<CreatedApp> createAppFromPlan(String requirement, List<String> modules);
  Future<CreatedApp> modifyApp(String appId, String instruction);
  Future<CreatedApp> publishApp(String appId);
}
