// Adapter test: the appstore-backed AppsClient maps the sdkwork-appstore
// catalog payloads onto the whatseek feed shapes with one batched listing
// resolution, and keeps whatseek-local user scope on the mock client.
//
// The gateway is faked at the response-envelope level (`dynamic data`), so the
// test also pins the envelope navigation (`data['item']` / `data['items']`).
import 'package:flutter_test/flutter_test.dart';
import 'package:sdkwork_appstore_app_sdk/sdkwork_appstore_app_sdk.dart';
import 'package:sdkwork_whatseek_flutter_mobile_apps/sdkwork_whatseek_flutter_mobile_apps.dart';
import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';

Map<String, dynamic> _listingRow(String id) => {
      'id': id,
      'displayName': '应用 $id',
      'pricingModel': 'FREE',
      'developerName': 'SDKWork',
      'description': '$id 的简介',
      'averageRating': '4.8',
      'ratingCount': 12000,
      'appType': 'APP',
      'releasedAt': '2026-09-01T00:00:00Z',
    };

Map<String, dynamic> _envelope(Map<String, dynamic> data) => data;

class _FakeGateway implements AppstoreCatalogGateway {
  _FakeGateway(this.home);

  final Map<String, dynamic> home;
  final List<String> searchedIds = [];
  // Stateful in-memory wishlist so toggle semantics can be pinned.
  final List<Map<String, dynamic>> wishlist = [];

  @override
  Future<HomeFeedResponse?> getHome() async => HomeFeedResponse(
        code: 0,
        data: _envelope({
          'item': {
            'featuredSlots': [
              {'listingId': 'app-hero'},
            ],
            'collections': [
              {
                'id': 'col-1',
                'collectionCode': 'picks',
                'collectionType': 'EDITORIAL',
                'localizations': [
                  {'locale': 'zh-CN', 'displayName': '本周精选', 'description': '编辑挑选'},
                ],
                'items': [
                  {'listingId': 'app-a'},
                  {'listingId': 'app-b'},
                ],
              },
            ],
            'charts': [
              {
                'chartCode': 'top',
                'rankingJson': [
                  {'listingId': 'app-a'},
                ],
              },
              {
                'chartCode': 'paid',
                'rankingJson': [
                  {'listingId': 'app-x'},
                ],
              },
            ],
          },
        }),
      );

  @override
  Future<AppstoreCatalogCollectionsRetrieveResponse?> getCollection(String collectionId) async =>
      AppstoreCatalogCollectionsRetrieveResponse(
        code: 0,
        data: _envelope({
          'item': {
            'id': collectionId,
            'collectionCode': collectionId,
            'collectionType': 'EDITORIAL',
            'localizations': [
              {'locale': 'zh-CN', 'displayName': '精选合集', 'description': '合集描述'},
            ],
            'items': [
              {'listingId': 'app-a'},
              {'listingId': 'app-b'},
            ],
          },
        }),
      );

  @override
  Future<AppstoreCatalogChartsRetrieveResponse?> getChart(String chartCode) async =>
      AppstoreCatalogChartsRetrieveResponse(
        code: 0,
        data: _envelope({
          'item': {
            'chartCode': chartCode,
            'rankingJson': [
              {'listingId': 'app-a'},
              {'listingId': 'app-b'},
            ],
          },
        }),
      );

  @override
  Future<ListingSummaryListResponse?> searchListings({
    String? q,
    String? categoryId,
    String? ids,
    int? pageSize,
  }) async {
    if (ids != null) {
      searchedIds.addAll(ids.split(','));
    }
    // Fixture convention: `app-*` ids are store listings; everything else
    // (e.g. `gen-*` created apps) resolves to nothing.
    final rows = ids == null
        ? [_listingRow('app-search')]
        : ids.split(',').where((id) => id.startsWith('app-')).map(_listingRow).toList();
    return ListingSummaryListResponse(
      code: 0,
      data: _envelope({'items': rows}),
    );
  }

  @override
  Future<SdkWorkListResponse?> listRecommendations({int? pageSize}) async =>
      SdkWorkListResponse(
        code: 0,
        data: _envelope({
          'items': [_listingRow('app-rec')],
        }),
      );

  @override
  Future<ListingResponse?> getListing(String listingId) async => ListingResponse(
        code: 0,
        data: _envelope({
          'item': {
            'id': listingId,
            'displayName': '应用 $listingId',
            'whatsNewSummary': '新增深色模式与批量导出',
            'currentVersion': '2.1.0',
            'description': '$listingId 的完整介绍，比摘要更长的描述文本内容。',
          },
        }),
      );

  @override
  Future<ListingMediaListResponse?> listListingMedia(String listingId) async =>
      ListingMediaListResponse(
        code: 0,
        data: _envelope({
          'items': [
            {
              'id': 'm-2',
              'mediaRole': 'SCREENSHOT',
              'mediaUrl': 'https://cdn.example.com/$listingId-shot2.png',
              'sortOrder': 2,
            },
            {
              'id': 'm-1',
              'mediaRole': 'SCREENSHOT',
              'mediaUrl': 'https://cdn.example.com/$listingId-shot1.png',
              'sortOrder': 1,
            },
            {
              'id': 'm-3',
              'mediaRole': 'ICON',
              'url': 'https://cdn.example.com/icon.png',
              'sortOrder': 0,
            },
          ],
        }),
      );

  @override
  Future<CategoryListResponse?> listCategories({int? pageSize}) async =>
      CategoryListResponse(
        code: 0,
        data: _envelope({
          'items': [
            {
              'id': 'cat-1',
              'categoryCode': 'efficiency',
              'localizations': [
                {'locale': 'zh-CN', 'displayName': '效率'},
              ],
            },
          ],
        }),
      );

  @override
  Future<WishlistItemListResponse?> listWishlist({int? pageSize}) async =>
      WishlistItemListResponse(
        code: 0,
        data: _envelope({'items': [...wishlist]}),
      );

  @override
  Future<WishlistItemResponse?> addWishlistItem(String listingId) async {
    wishlist.add({
      'id': 'w-${wishlist.length + 1}',
      'listingId': listingId,
      'wishlistStatus': 'ACTIVE',
    });
    return WishlistItemResponse(code: 0, data: _envelope({'item': wishlist.last}));
  }

  @override
  Future<void> removeWishlistItem(String listingId) async {
    wishlist.removeWhere((item) => item['listingId'] == listingId);
  }
}

void main() {
  test('listHomeFeed_assembles_the_feed_with_one_batched_resolution', () async {
    final gateway = _FakeGateway({});
    final client = AppstoreAppsClient(gateway: gateway);

    final feed = await client.listHomeFeed();

    expect(feed.heroes, hasLength(1));
    expect(feed.heroes.first.appId, 'app-hero');
    expect(feed.heroes.first.title, '应用 app-hero');
    // The appstore feed carries no editorial story blocks.
    expect(feed.stories, isEmpty);
    expect(feed.collections.first.title, '本周精选');
    expect(feed.collections.first.coverApps.map((app) => app.id), ['app-a', 'app-b']);
    // Chart previews map known codes (top→hot) and skip whatseek-unknown ones (paid).
    expect(feed.charts.map((chart) => chart.id), [AppChartId.hot]);
    expect(feed.charts.first.apps.map((app) => app.id), ['app-a']);
    // One batched listing resolution across heroes + covers + chart entries.
    expect(gateway.searchedIds, ['app-hero', 'app-a', 'app-b']);
  });

  test('collections_and_charts_resolve_through_the_catalog', () async {
    final gateway = _FakeGateway({});
    final client = AppstoreAppsClient(gateway: gateway);

    final collection = await client.getCollection('col-1');
    expect(collection!.kind, AppCollectionKind.editorial);
    expect(collection.appIds, ['app-a', 'app-b']);
    expect((await client.listCollectionApps('col-1')).map((app) => app.id), ['app-a', 'app-b']);

    // whatseek 热门榜 maps onto the appstore top chart.
    final hot = await client.listChart(AppChartId.hot);
    expect(hot.map((app) => app.id), ['app-a', 'app-b']);
  });

  test('search_maps_listing_rows_and_created_apps_fall_back_to_local', () async {
    final gateway = _FakeGateway({});
    final client = AppstoreAppsClient(gateway: gateway);

    final results = await client.searchApps('帮我找一个视频剪辑工具');
    expect(results, hasLength(1));
    expect(results.first.reason, 'appstore');
    expect(results.first.app.priceLabel, '免费');

    // Stopword-only queries never reach the gateway.
    expect(await client.searchApps('帮我找一个工具'), isEmpty);

    // The whatseek-local creation scope stays on the mock client.
    final plan = client.draftCreationPlan('订单管理');
    expect(plan.title, isNotEmpty);
    expect(await client.listMyApps(), isEmpty);
  });

  test('categories_map_localized_store_names', () async {
    final client = AppstoreAppsClient(gateway: _FakeGateway({}));
    final categories = await client.listCategories();
    expect(categories.first.id, 'cat-1');
    expect(categories.first.labelKey, '效率');
  });

  test('favorites_ride_the_wishlist_while_created_apps_stay_local', () async {
    final gateway = _FakeGateway({});
    final client = AppstoreAppsClient(gateway: gateway);

    // Store-listing favorites ride the appstore wishlist.
    expect(await client.toggleFavorite('app-a'), isTrue);
    expect(gateway.wishlist.map((item) => item['listingId']), ['app-a']);
    expect((await client.listFavorites()).map((app) => app.id), ['app-a']);
    expect(await client.toggleFavorite('app-a'), isFalse);
    expect(gateway.wishlist, isEmpty);
    expect(await client.listFavorites(), isEmpty);

    // AI-created apps stay whatseek-local (never store listings).
    final plan = client.draftCreationPlan('团队周报助手');
    expect(plan.title, isNotEmpty);
  });

  test('getAppDetail_hydrates_detail_and_screenshot_media_for_store_apps', () async {
    final gateway = _FakeGateway({});
    final client = AppstoreAppsClient(gateway: gateway);

    final app = await client.getAppDetail('app-a');
    expect(app, isNotNull);
    expect(app!.whatsNew, '新增深色模式与批量导出');
    expect(app.currentVersion, '2.1.0');
    // The longer listing description replaces the summary preview.
    expect(app.summary, contains('完整介绍'));
    // Only SCREENSHOT-role media with renderable URLs, sorted by sortOrder.
    expect(app.screenshots, [
      'https://cdn.example.com/app-a-shot1.png',
      'https://cdn.example.com/app-a-shot2.png',
    ]);
  });

  test('getAppDetail_falls_back_to_the_local_client_for_created_apps', () async {
    final gateway = _FakeGateway({});
    final client = AppstoreAppsClient(gateway: gateway);

    // gen-* ids never resolve as store listings — the local mock answers.
    final plan = client.draftCreationPlan('订单管理');
    expect(plan.title, isNotEmpty);
    expect(await client.getAppDetail('gen-unknown'), isNull);
  });
}
