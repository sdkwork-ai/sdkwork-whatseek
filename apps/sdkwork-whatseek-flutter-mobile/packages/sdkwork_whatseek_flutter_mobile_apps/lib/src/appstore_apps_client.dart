/// Appstore-backed `AppsClient` over the generated Dart SDK family
/// `sdkwork_appstore_app_sdk` (`/app/v3/api`; APP_SDK_INTEGRATION_SPEC.md §9
/// consumer naming — the Dart mirror of the TS `@sdkwork/appstore-app-sdk`
/// adapter owned by the shared common family).
///
/// The composed SDK client is constructed exactly once at the bootstrap
/// composition root (`lib/bootstrap/sdk_clients.dart`) and injected here
/// through the narrow `AppstoreCatalogGateway` slice. This class only maps
/// appstore catalog contracts onto the whatseek `AppsClient`; it never builds
/// transport, tokens, or HTTP on its own. Feed assembly mirrors the
/// sdkwork-appstore reference consumption: featured slots and chart snapshots
/// carry listing ids resolved into cards through one batched listing search.
///
/// Wire notes: the Dart generated family keeps the `{code, data, traceId}`
/// envelope (`dynamic data`), so this boundary navigates `data['item']` /
/// `data['items']` defensively. Whatseek-local user scope is split by backing:
/// 收藏 for store listings rides the appstore wishlist, while 最近使用 and the
/// AI-created 我的应用 lifecycle stay on the mock client (`local`) — the
/// appstore app-api has no counterpart for them.
library;

import 'package:sdkwork_appstore_app_sdk/sdkwork_appstore_app_sdk.dart';
import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';

/// Narrow slice of the composed appstore client this adapter consumes: the
/// catalog API for feed/search/browse, the listings API for the detail
/// enrichment (listing detail + media), and the wishlist API for 收藏
/// (server-side store favorites; created apps stay whatseek-local).
abstract class AppstoreCatalogGateway {
  Future<HomeFeedResponse?> getHome();
  Future<AppstoreCatalogCollectionsRetrieveResponse?> getCollection(String collectionId);
  Future<AppstoreCatalogChartsRetrieveResponse?> getChart(String chartCode);
  Future<ListingSummaryListResponse?> searchListings({
    String? q,
    String? categoryId,
    String? ids,
    int? pageSize,
  });
  Future<SdkWorkListResponse?> listRecommendations({int? pageSize});
  Future<SdkWorkListResponse?> listTrendingSearchTerms({int? pageSize});
  Future<SdkWorkListResponse?> listSearchSuggestions(String q);
  Future<CategoryListResponse?> listCategories({int? pageSize});
  Future<ListingResponse?> getListing(String listingId);
  Future<ListingMediaListResponse?> listListingMedia(String listingId);
  Future<WishlistItemListResponse?> listWishlist({int? pageSize});
  Future<WishlistItemResponse?> addWishlistItem(String listingId);
  Future<void> removeWishlistItem(String listingId);
}

/// Default gateway over the composed appstore client's catalog + wishlist API.
class SdkworkAppstoreCatalogGateway implements AppstoreCatalogGateway {
  SdkworkAppstoreCatalogGateway(this._client);

  final SdkworkAppstoreAppClient _client;

  @override
  Future<HomeFeedResponse?> getHome() => _client.catalog.appstoreCatalogHomeRetrieve();

  @override
  Future<AppstoreCatalogCollectionsRetrieveResponse?> getCollection(String collectionId) =>
      _client.catalog.appstoreCatalogCollectionsRetrieve(collectionId);

  @override
  Future<AppstoreCatalogChartsRetrieveResponse?> getChart(String chartCode) =>
      _client.catalog.appstoreCatalogChartsRetrieve(chartCode);

  @override
  Future<ListingSummaryListResponse?> searchListings({
    String? q,
    String? categoryId,
    String? ids,
    int? pageSize,
  }) =>
      _client.catalog.appstoreCatalogListingsList(q, categoryId, ids, null, pageSize);

  @override
  Future<SdkWorkListResponse?> listRecommendations({int? pageSize}) =>
      _client.catalog.appstoreCatalogRecommendationsList(null, null, null, pageSize);

  @override
  Future<SdkWorkListResponse?> listTrendingSearchTerms({int? pageSize}) =>
      _client.catalog.appstoreCatalogSearchTrendingList('zh-CN', pageSize);

  @override
  Future<SdkWorkListResponse?> listSearchSuggestions(String q) =>
      _client.catalog.appstoreCatalogSearchSuggestionsList(q);

  @override
  Future<CategoryListResponse?> listCategories({int? pageSize}) =>
      _client.catalog.appstoreCatalogCategoriesList(null, pageSize, null);

  @override
  Future<ListingResponse?> getListing(String listingId) =>
      _client.listings.appstoreListingsRetrieve(listingId);

  @override
  Future<ListingMediaListResponse?> listListingMedia(String listingId) =>
      _client.listings.appstoreListingsMediaList(listingId);

  @override
  Future<WishlistItemListResponse?> listWishlist({int? pageSize}) =>
      _client.wishlist.appstoreWishlistItemsList(null, pageSize);

  @override
  Future<WishlistItemResponse?> addWishlistItem(String listingId) => _client.wishlist
      .appstoreWishlistItemsCreate(WishlistItemAddRequest(listingId: listingId), _idempotencyKey());

  @override
  Future<void> removeWishlistItem(String listingId) =>
      _client.wishlist.appstoreWishlistItemsDelete(listingId);
}

/// Client-generated idempotency key for the wishlist add command
/// (API_SPEC §15 command pattern; unique per attempt).
String _idempotencyKey() => 'whatseek-${DateTime.now().microsecondsSinceEpoch}';

/// Await a response future and return its `data` envelope map, or `null` when
/// the call fails or the payload is not a map (best-effort hydration).
Future<Map<String, dynamic>?> _safeData(Future<Object?> future) async {
  try {
    final response = await future;
    return _asMap((response as dynamic)?.data);
  } catch (_) {
    return null;
  }
}

/// Search-suggestion/trending rows carry the term under one of these fields.
String _readSearchTerm(Map<String, dynamic> row) {
  return _string(row['term']) ?? _string(row['keyword']) ?? _string(row['suggestion']) ?? '';
}

/// whatseek chart tabs mapped onto appstore chart snapshot codes.
const Map<AppChartId, String> kAppstoreChartCodes = {
  AppChartId.hot: 'top',
  AppChartId.free: 'free',
  AppChartId.newest: 'new',
};

const int _heroSlotLimit = 5;
const int _chartPreviewSize = 3;
const int _chartSize = 10;
const int _listPageSize = 50;

/// Deterministic tile glyph for store listings (Phase-1 emoji tile visual).
const List<String> _glyphPalette = ['🧩', '🤖', '📦', '🚀', '🧠', '💡', '🛠️', '📊'];

String _glyphFor(String id) {
  var hash = 0;
  for (final codeUnit in id.codeUnits) {
    hash = (hash * 31 + codeUnit) & 0x7fffffff;
  }
  return _glyphPalette[hash % _glyphPalette.length];
}

Map<String, dynamic>? _asMap(Object? value) =>
    value is Map<String, dynamic> ? value : null;

List<Map<String, dynamic>> _asList(Object? value) =>
    value is List<Object?> ? value.whereType<Map<String, dynamic>>().toList() : const [];

String? _string(Object? value) => value is String ? value : null;

int? _int(Object? value) => value is int ? value : null;

double _rating(Object? value) {
  final raw = _string(value);
  if (raw == null) return 0;
  return double.tryParse(raw) ?? 0;
}

WhatseekAppKind _kind(String? appType) {
  if (appType == 'AGENT') return WhatseekAppKind.agent;
  if (appType == 'PLUGIN' || appType == 'EXPERT') return WhatseekAppKind.skill;
  return WhatseekAppKind.web;
}

WhatseekApp _mapSummary(Map<String, dynamic> row) {
  final id = _string(row['id']) ?? '';
  final ratingCount = _int(row['ratingCount']);
  final releasedAt = _string(row['releasedAt']);
  return WhatseekApp(
    id: id,
    name: _string(row['displayName']) ?? '应用',
    summary: _string(row['description']) ?? _string(row['subtitle']) ?? '',
    developer: _string(row['developerName']) ?? 'SDKWork',
    category: 'appstore',
    kind: _kind(_string(row['appType'])),
    icon: _glyphFor(id),
    rating: _rating(row['averageRating']),
    usersLabel: ratingCount == null ? '—' : '$ratingCount',
    priceLabel: (_string(row['pricingModel']) ?? 'FREE') == 'FREE' ? '免费' : '付费',
    aiCapability: _string(row['appType']) == 'AGENT',
    tags: const [],
    updatedAt: releasedAt == null || releasedAt.length < 10 ? '' : releasedAt.substring(0, 10),
    permissions: const [],
  );
}

/// zh-CN-first localized field reader (sdkwork-appstore reference rule).
String _localized(List<Map<String, dynamic>> localizations, String field) {
  if (localizations.isEmpty) return '';
  Map<String, dynamic> preferred = localizations.first;
  for (final entry in localizations) {
    if (_string(entry['locale']) == 'zh-CN' || _string(entry['locale']) == 'zh_CN') {
      preferred = entry;
      break;
    }
  }
  return (_string(preferred[field]) ?? '').trim();
}

class AppstoreAppsClient implements AppsClient {
  AppstoreAppsClient({required AppstoreCatalogGateway gateway, MockAppsClient? local})
      : _gateway = gateway,
        _local = local ?? MockAppsClient();

  final AppstoreCatalogGateway _gateway;
  final MockAppsClient _local;

  /// Resolve listing ids into whatseek apps, preserving the given order.
  Future<List<WhatseekApp>> _resolveListings(List<String> ids) async {
    final unique = ids.toSet().where((id) => id.isNotEmpty).take(_listPageSize).toList();
    if (unique.isEmpty) {
      return const [];
    }
    final page = await _gateway.searchListings(ids: unique.join(','), pageSize: unique.length);
    final byId = <String, WhatseekApp>{};
    for (final row in _asList(_asMap(page?.data)?['items'])) {
      final app = _mapSummary(row);
      byId[app.id] = app;
    }
    return [
      for (final id in unique)
        if (byId[id] != null) byId[id]!,
    ];
  }

  List<String> _rankingIds(Map<String, dynamic>? snapshot) => snapshot == null
      ? const []
      : _asList(snapshot['rankingJson'])
          .map((entry) => _string(entry['listingId']) ?? '')
          .where((id) => id.isNotEmpty)
          .toList();

  List<String> _collectionIds(Map<String, dynamic> collection) => _asList(collection['items'])
      .map((entry) => _string(entry['listingId']) ?? '')
      .where((id) => id.isNotEmpty)
      .toList();

  AppCollectionKind _collectionKind(String? collectionType) {
    switch (collectionType) {
      case 'EDITORIAL':
        return AppCollectionKind.editorial;
      case 'EVENT':
        return AppCollectionKind.event;
      case 'CHART':
        return AppCollectionKind.chart;
      default:
        return AppCollectionKind.theme;
    }
  }

  AppCollection _mapCollection(Map<String, dynamic> row) {
    final localizations = _asList(row['localizations']);
    return AppCollection(
      id: _string(row['id']) ?? '',
      title: _localized(localizations, 'displayName') != ''
          ? _localized(localizations, 'displayName')
          : (_string(row['collectionCode']) ?? ''),
      description: _localized(localizations, 'description'),
      kind: _collectionKind(_string(row['collectionType'])),
      appIds: _collectionIds(row),
    );
  }

  @override
  Future<List<AppRecommendation>> searchApps(String query) async {
    final keywords = extractSearchKeywords(query);
    if (keywords.isEmpty) {
      return const [];
    }
    final page = await _gateway.searchListings(q: keywords.join(' '), pageSize: _listPageSize);
    // Unmatched creation-capable demand falls through to AI creation at the
    // router level (Create as Default); search itself returns what exists.
    return [
      for (final row in _asList(_asMap(page?.data)?['items']))
        AppRecommendation(app: _mapSummary(row), reason: 'appstore'),
    ];
  }

  @override
  Future<List<String>> listTrendingSearches() async {
    // Server-side store terms, zh-CN first (sdkwork-appstore reference rule).
    final page = await _gateway.listTrendingSearchTerms(pageSize: 10);
    return _asList(_asMap(page?.data)?['items'])
        .map(_readSearchTerm)
        .where((term) => term.isNotEmpty)
        .toList();
  }

  @override
  Future<List<String>> listSearchSuggestions(String query) async {
    final trimmed = query.trim();
    if (trimmed.isEmpty) {
      return const [];
    }
    final page = await _gateway.listSearchSuggestions(trimmed);
    final terms = _asList(_asMap(page?.data)?['items'])
        .map(_readSearchTerm)
        .where((term) => term.isNotEmpty && term != trimmed)
        .toList();
    return terms.toSet().toList();
  }

  @override
  Future<AppHomeFeed> listHomeFeed() async {
    final envelope = _asMap((await _gateway.getHome())?.data);
    final item = envelope == null ? null : _asMap(envelope['item']);
    if (item == null) {
      return const AppHomeFeed(heroes: [], stories: [], collections: [], charts: []);
    }
    final heroIds = _asList(item['featuredSlots'])
        .map((slot) => _string(slot['listingId']) ?? '')
        .where((id) => id.isNotEmpty)
        .take(_heroSlotLimit)
        .toList();
    final collections = _asList(item['collections']).map(_mapCollection).toList();
    final charts = _asList(item['charts'])
        .where((snapshot) => kAppstoreChartCodes.values.contains(_string(snapshot['chartCode'])))
        .toList();

    return _resolveFeed(heroIds: heroIds, collections: collections, chartSnapshots: charts);
  }

  Future<AppHomeFeed> _resolveFeed({
    required List<String> heroIds,
    required List<AppCollection> collections,
    required List<Map<String, dynamic>> chartSnapshots,
  }) async {
    // One batched resolution for every listing id on the feed (heroes,
    // collection covers, chart entries).
    final feedIds = <String>[
      ...heroIds,
      for (final collection in collections) ...collection.appIds,
      for (final snapshot in chartSnapshots) ..._rankingIds(snapshot),
    ];
    final resolved = await _resolveListings(feedIds);
    final byId = {for (final app in resolved) app.id: app};
    List<WhatseekApp> pick(List<String> ids, int limit) => [
          for (final id in ids)
            if (byId[id] != null) byId[id]!,
        ].take(limit).toList();

    return AppHomeFeed(
      // The appstore home feed carries no editorial story blocks; the stories
      // rail stays empty until appstore ships one (UI hides it).
      heroes: [
        for (final app in pick(heroIds, _heroSlotLimit))
          AppHeroSlide(
            id: app.id,
            title: app.name,
            tagline: app.summary.isNotEmpty ? app.summary : app.developer,
            badge: app.priceLabel,
            appId: app.id,
            icon: app.icon,
          ),
      ],
      stories: const [],
      collections: [
        for (final collection in collections)
          AppCollectionCard(
            id: collection.id,
            title: collection.title,
            description: collection.description,
            kind: collection.kind,
            coverApps: pick(collection.appIds, 4),
          ),
      ],
      charts: [
        for (final entry in kAppstoreChartCodes.entries)
          for (final snapshot in chartSnapshots)
            if (_string(snapshot['chartCode']) == entry.value)
              AppChartPreview(
                id: entry.key,
                apps: pick(_rankingIds(snapshot), _chartPreviewSize),
              ),
      ],
    );
  }

  @override
  Future<AppCollection?> getCollection(String collectionId) async {
    final collection = _asMap((await _gateway.getCollection(collectionId))?.data);
    final item = collection == null ? null : _asMap(collection['item']);
    return item == null ? null : _mapCollection(item);
  }

  @override
  Future<List<WhatseekApp>> listCollectionApps(String collectionId) async {
    final collection = await getCollection(collectionId);
    if (collection == null) {
      return const [];
    }
    return _resolveListings(collection.appIds);
  }

  @override
  Future<List<WhatseekApp>> listChart(AppChartId chartId) async {
    final snapshot = _asMap((await _gateway.getChart(kAppstoreChartCodes[chartId]!))?.data);
    final item = snapshot == null ? null : _asMap(snapshot['item']);
    return (await _resolveListings(_rankingIds(item))).take(_chartSize).toList();
  }

  @override
  Future<List<WhatseekApp>> listRecommended() async {
    final page = await _gateway.listRecommendations(pageSize: 12);
    return [
      for (final row in _asList(_asMap(page?.data)?['items'])) _mapSummary(row),
    ];
  }

  @override
  Future<List<WhatseekApp>> listHot() async {
    final snapshot = _asMap((await _gateway.getChart(kAppstoreChartCodes[AppChartId.hot]!))?.data);
    final item = snapshot == null ? null : _asMap(snapshot['item']);
    return (await _resolveListings(_rankingIds(item))).take(8).toList();
  }

  @override
  Future<List<AppCategory>> listCategories() async {
    final page = await _gateway.listCategories(pageSize: 24);
    return [
      for (final row in _asList(_asMap(page?.data)?['items']))
        AppCategory(
          id: _string(row['id']) ?? '',
          // The label renders through the localized store name; chips translate
          // unknown keys through unchanged (i18next parity).
          labelKey: _localized(_asList(row['localizations']), 'displayName') != ''
              ? _localized(_asList(row['localizations']), 'displayName')
              : (_string(row['categoryCode']) ?? ''),
          icon: '📦',
        ),
    ];
  }

  @override
  Future<WhatseekApp?> getApp(String appId) async {
    final page = await _gateway.searchListings(ids: appId, pageSize: 1);
    final items = _asList(_asMap(page?.data)?['items']);
    return items.isEmpty ? _local.getApp(appId) : _mapSummary(items.first);
  }

  @override
  Future<WhatseekApp?> getAppDetail(String appId) async {
    final page = await _gateway.searchListings(ids: appId, pageSize: 1);
    final items = _asList(_asMap(page?.data)?['items']);
    if (items.isEmpty) {
      return _local.getAppDetail(appId);
    }
    final app = _mapSummary(items.first);
    // Detail + media hydrate best-effort: a failing call keeps the
    // summary-shaped app (screenshots fall back to the UI placeholder).
    final envelopes = await Future.wait<Map<String, dynamic>?>([
      _safeData(_gateway.getListing(appId)),
      _safeData(_gateway.listListingMedia(appId)),
    ]);
    var whatsNew = app.whatsNew;
    var currentVersion = app.currentVersion;
    var summary = app.summary;
    final detail = _asMap(envelopes[0]?['item']);
    if (detail != null) {
      final detailWhatsNew = _string(detail['whatsNewSummary']);
      if (detailWhatsNew != null) {
        whatsNew = detailWhatsNew;
      }
      final detailVersion = _string(detail['currentVersion']);
      if (detailVersion != null) {
        currentVersion = detailVersion;
      }
      final description = _string(detail['description']);
      if (description != null && description.length > summary.length) {
        summary = description;
      }
    }
    final screenshots = _asList(envelopes[1]?['items'])
        .where((item) => _string(item['mediaRole']) == 'SCREENSHOT')
        .toList()
      ..sort((left, right) =>
          (left['sortOrder'] as num? ?? 0).compareTo(right['sortOrder'] as num? ?? 0));
    final screenshotUrls = screenshots
        .map((item) => _string(item['mediaUrl']) ?? _string(item['url']))
        .whereType<String>()
        .take(6)
        .toList();
    return _withDetail(app, whatsNew: whatsNew, currentVersion: currentVersion, summary: summary, screenshots: screenshotUrls);
  }

  // Whatseek-local user scope, split by backing: 收藏 for store listings is
  // the appstore wishlist (server-side, per account); 最近使用 and the
  // AI-created 我的应用 lifecycle have no appstore app-api resource and stay
  // on the mock client. The two id spaces are disjoint (listing ids vs
  // `gen-*` created ids), so the merged list never duplicates.
  @override
  Future<WhatseekApp?> openApp(String appId, {bool isVisitor = false}) async {
    final app = await getApp(appId);
    if (app == null) {
      return null;
    }
    await _local.recordRecent(appId);
    return app;
  }

  @override
  Future<void> recordRecent(String appId) => _local.recordRecent(appId);

  @override
  Future<List<WhatseekApp>> listRecent() => _local.listRecent();

  @override
  Future<List<WhatseekApp>> listFavorites() async {
    final wishlistPage = await _gateway.listWishlist(pageSize: _listPageSize);
    final ids = _asList(_asMap(wishlistPage?.data)?['items'])
        .map((item) => _string(item['listingId']) ?? '')
        .where((id) => id.isNotEmpty)
        .toList();
    final wishlistApps = await _resolveListings(ids);
    return [...wishlistApps, ...await _local.listFavorites()];
  }

  @override
  Future<bool> toggleFavorite(String appId) async {
    // Created apps never resolve as store listings — keep them local.
    final page = await _gateway.searchListings(ids: appId, pageSize: 1);
    if (_asList(_asMap(page?.data)?['items']).isEmpty) {
      return _local.toggleFavorite(appId);
    }
    final wishlistPage = await _gateway.listWishlist(pageSize: _listPageSize);
    final wishlisted = _asList(_asMap(wishlistPage?.data)?['items'])
        .any((item) => _string(item['listingId']) == appId);
    if (wishlisted) {
      await _gateway.removeWishlistItem(appId);
      return false;
    }
    await _gateway.addWishlistItem(appId);
    return true;
  }

  @override
  Future<List<CreatedApp>> listMyApps() => _local.listMyApps();

  @override
  Future<CreatedApp?> getMyApp(String appId) => _local.getMyApp(appId);

  @override
  Future<void> deleteMyApp(String appId) => _local.deleteMyApp(appId);

  @override
  ({List<String> modules, List<String> pages, List<String> dataModel, String title})
      draftCreationPlan(String requirement) => _local.draftCreationPlan(requirement);

  @override
  Future<CreatedApp> createAppFromPlan(String requirement, List<String> modules) =>
      _local.createAppFromPlan(requirement, modules);

  @override
  Future<CreatedApp> modifyApp(String appId, String instruction) =>
      _local.modifyApp(appId, instruction);

  @override
  Future<CreatedApp> publishApp(String appId) => _local.publishApp(appId);
}

/// Rebuild [app] with detail-enrichment fields (WhatseekApp fields are final).
WhatseekApp _withDetail(
  WhatseekApp app, {
  String? whatsNew,
  String? currentVersion,
  String? summary,
  List<String>? screenshots,
}) {
  return WhatseekApp(
    id: app.id,
    name: app.name,
    summary: summary ?? app.summary,
    developer: app.developer,
    category: app.category,
    kind: app.kind,
    icon: app.icon,
    rating: app.rating,
    usersLabel: app.usersLabel,
    priceLabel: app.priceLabel,
    aiCapability: app.aiCapability,
    tags: app.tags,
    updatedAt: app.updatedAt,
    permissions: app.permissions,
    whatsNew: whatsNew,
    currentVersion: currentVersion,
    screenshots: screenshots,
  );
}
