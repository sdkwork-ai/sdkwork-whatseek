/// Domain model for the WhatSeek Flutter surface. The shapes mirror the shared
/// TS domain (`@sdkwork/whatseek-service-core`); Dart cannot import TS, so the
/// contract is re-declared here and exercised by the alignment tests.
library;

/// PRD §15 application forms.
enum WhatseekAppKind { web, mini, ai, agent, skill, external, enterprise, generated }

/// PRD §20 lifecycle states for AI-generated apps.
enum CreatedAppLifecycle { draft, generating, preview, published, updated, archived }

/// PRD §26 contact kinds.
enum ContactKind { person, group, org, agent, assistant }

/// PRD §27 conversation kinds.
enum ConversationKind { direct, group, system, app, agent, task }

/// PRD §41 task states.
enum TaskState {
  pending,
  running,
  waitingConfirmation,
  completed,
  failed,
  cancelled,
  expired;

  /// i18n key for the localized label (`whatseek.chat.task.*`, aligned with
  /// the H5 chat fragment).
  String get labelKey => switch (this) {
        TaskState.pending => 'whatseek.chat.task.pending',
        TaskState.running => 'whatseek.chat.task.running',
        TaskState.waitingConfirmation => 'whatseek.chat.task.waiting_confirmation',
        TaskState.completed => 'whatseek.chat.task.completed',
        TaskState.failed => 'whatseek.chat.task.failed',
        TaskState.cancelled => 'whatseek.chat.task.cancelled',
        TaskState.expired => 'whatseek.chat.task.expired',
      };
}

/// Thrown when the session lacks access to an app (PRD §16: enterprise apps
/// require a named account) — the mock counterpart of an app-api
/// permission-denied ProblemDetail, rendered as the runner's
/// permission-denied state (H5 parity).
class WhatseekPermissionDeniedException implements Exception {
  const WhatseekPermissionDeniedException();

  @override
  String toString() => 'WhatseekPermissionDeniedException';
}

class WhatseekApp {
  const WhatseekApp({
    required this.id,
    required this.name,
    required this.summary,
    required this.developer,
    required this.category,
    required this.kind,
    required this.icon,
    required this.rating,
    required this.usersLabel,
    required this.priceLabel,
    required this.aiCapability,
    required this.tags,
    required this.updatedAt,
    required this.permissions,
  });

  final String id;
  final String name;
  final String summary;
  final String developer;
  final String category;
  final WhatseekAppKind kind;
  final String icon;
  final double rating;
  final String usersLabel;
  final String priceLabel;
  final bool aiCapability;
  final List<String> tags;
  final String updatedAt;
  final List<String> permissions;
}

class CreatedApp {
  const CreatedApp({
    required this.id,
    required this.name,
    required this.requirement,
    required this.modules,
    required this.lifecycle,
    required this.createdAt,
    required this.updatedAt,
    required this.versions,
    required this.icon,
  });

  final String id;
  final String name;
  final String requirement;
  final List<String> modules;
  final CreatedAppLifecycle lifecycle;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<String> versions;
  final String icon;
}

class AppCategory {
  const AppCategory({required this.id, required this.labelKey, required this.icon});

  final String id;

  /// i18n key for the localized label (`whatseek.apps.category.*`).
  final String labelKey;
  final String icon;
}

class AppRecommendation {
  const AppRecommendation({required this.app, required this.reason});

  final WhatseekApp app;
  final String reason;
}

/// Appstore-style chart identities (sdkwork-appstore PRD §5.1). `new` is the
/// cross-surface wire value but a Dart keyword, so the member is [newest] and
/// [id] carries the TS wire value.
enum AppChartId {
  hot,
  free,
  newest;

  /// Cross-surface chart id exactly as the TS surfaces declare it
  /// (`hot` / `free` / `new`) — also the i18n key suffix
  /// (`whatseek.apps.chart.*`).
  String get id => switch (this) {
        AppChartId.hot => 'hot',
        AppChartId.free => 'free',
        AppChartId.newest => 'new',
      };
}

/// Appstore-style home feed hero slide (PRD §5.1): one editorial campaign
/// banner opening its featured app.
class AppHeroSlide {
  const AppHeroSlide({
    required this.id,
    required this.title,
    required this.tagline,
    required this.badge,
    required this.appId,
    required this.icon,
  });

  final String id;

  /// Editorial campaign headline.
  final String title;

  /// One-line tagline under the headline.
  final String tagline;

  /// Small badge label, e.g. 编辑推荐.
  final String badge;

  /// Featured app the slide opens.
  final String appId;
  final String icon;
}

/// Editorial story card (appstore Today 故事卡) — links to its featured app.
class AppStoryCard {
  const AppStoryCard({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.appId,
    required this.icon,
  });

  final String id;
  final String title;
  final String subtitle;

  /// App the story links to.
  final String appId;
  final String icon;
}

/// PRD appstore collection kinds (编辑精选合集).
enum AppCollectionKind { editorial, chart, theme, event }

/// Curated appstore collection: editorial metadata plus the curated app ids.
class AppCollection {
  const AppCollection({
    required this.id,
    required this.title,
    required this.description,
    required this.kind,
    required this.appIds,
  });

  final String id;
  final String title;
  final String description;
  final AppCollectionKind kind;
  final List<String> appIds;
}

/// Home-feed collection card with cover apps already resolved.
class AppCollectionCard {
  const AppCollectionCard({
    required this.id,
    required this.title,
    required this.description,
    required this.kind,
    required this.coverApps,
  });

  final String id;
  final String title;
  final String description;
  final AppCollectionKind kind;

  /// Cover apps for the card's mini icon grid (up to four).
  final List<WhatseekApp> coverApps;
}

/// One chart's quick view on the home feed (top entries only).
class AppChartPreview {
  const AppChartPreview({required this.id, required this.apps});

  final AppChartId id;
  final List<WhatseekApp> apps;
}

/// Appstore-style home feed blocks (sdkwork-appstore PRD §4.2.1 首页编辑流 /
/// §5.1 首页), served by the 应用 tab root. Editorial content is Phase 1 mock
/// data seeded alongside the catalog; Phase 2 swaps in the appstore catalog SDK.
class AppHomeFeed {
  const AppHomeFeed({
    required this.heroes,
    required this.stories,
    required this.collections,
    required this.charts,
  });

  final List<AppHeroSlide> heroes;
  final List<AppStoryCard> stories;
  final List<AppCollectionCard> collections;
  final List<AppChartPreview> charts;
}

class Contact {
  const Contact({
    required this.id,
    required this.name,
    required this.kind,
    required this.bio,
    required this.tags,
    required this.avatar,
    this.company,
  });

  final String id;
  final String name;
  final ContactKind kind;
  final String bio;
  final List<String> tags;
  final String avatar;
  final String? company;
}

class Conversation {
  const Conversation({
    required this.id,
    required this.kind,
    this.titleKey,
    this.title,
    this.contactId,
    this.taskId,
    required this.unread,
    this.updatedAt,
    this.lastMessagePreview,
  });

  final String id;
  final ConversationKind kind;
  final String? titleKey;
  final String? title;
  final String? contactId;
  final String? taskId;
  final int unread;
  final DateTime? updatedAt;
  final String? lastMessagePreview;
}

class ChatMessage {
  const ChatMessage({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.senderName,
    required this.content,
    required this.sentAt,
  });

  final String id;
  final String conversationId;
  final String senderId;
  final String senderName;
  final String content;
  final DateTime sentAt;
}

class WhatseekTask {
  const WhatseekTask({
    required this.id,
    required this.title,
    required this.intent,
    required this.state,
    required this.createdAt,
    required this.updatedAt,
    this.resultSummary,
    this.createdAppId,
  });

  final String id;
  final String title;
  final String intent;
  final TaskState state;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? resultSummary;
  final String? createdAppId;
}

/// Chat card payload rendered under an AI reply.
class ChatCard {
  const ChatCard({
    required this.type,
    this.apps = const [],
    this.contacts = const [],
    this.planTitle = '',
    this.planModules = const [],
    this.planPages = const [],
    this.planDataModel = const [],
    this.planRequirement = '',
    this.contactId = '',
    this.contactName = '',
    this.draft = '',
    this.commerceDomain = '',
    this.commerceItems = const [],
  });

  final String type;
  final List<AppRecommendation> apps;
  final List<Contact> contacts;
  final String planTitle;
  final List<String> planModules;
  final List<String> planPages;
  final List<String> planDataModel;
  final String planRequirement;
  final String contactId;
  final String contactName;
  final String draft;
  final String commerceDomain;
  final List<CommerceResult> commerceItems;
}

class CommerceResult {
  const CommerceResult({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.priceLabel,
  });

  final String id;
  final String title;
  final String subtitle;
  final String priceLabel;
}

class ChatReply {
  const ChatReply({
    required this.text,
    this.params = const {},
    this.cards = const [],
    this.taskId,
  });

  /// Reply copy as an i18n key (`whatseek.chat.reply.*`) — the UI translates
  /// it and falls back to the raw text (H5 `defaultValue` semantics).
  final String text;
  final Map<String, Object?> params;
  final List<ChatCard> cards;
  final String? taskId;
}

/// Serializable result of a card action; [messageKey] is an i18n key
/// (`whatseek.chat.reply.action.*`) translated by the chat screen.
class ChatActionOutcome {
  const ChatActionOutcome({required this.messageKey, this.params = const {}, this.taskId});

  final String messageKey;
  final Map<String, Object?> params;

  /// Task started/resolved by the action — rendered as a state chip on the
  /// outcome bubble (H5 parity).
  final String? taskId;
}

class SessionUser {
  const SessionUser({
    required this.id,
    required this.name,
    required this.avatar,
    required this.isVisitor,
  });

  final String id;
  final String name;
  final String avatar;
  final bool isVisitor;
}
