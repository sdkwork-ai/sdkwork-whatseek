// Unit tests for the appstore home feed mock API (PRD §4/§5.1 编辑流):
// home feed composition (heroes → stories → collections → chart quick views),
// collection lookup, curated collection resolution, and the hot/free/new
// chart derivations — the Dart port of the shared TS `homeFeed.ts`.
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';

void main() {
  final client = MockAppsClient();

  group('listHomeFeed', () {
    test('composes_heroes_stories_collections_and_chart_quick_views',
        () async {
      final feed = await client.listHomeFeed();

      expect(feed.heroes.map((slide) => slide.id).toList(),
          ['hero-ai-coding', 'hero-go-global', 'hero-office-week']);
      // Hero slides open their featured catalog app.
      expect(
        feed.heroes.map((slide) => slide.appId).toList(),
        ['code-mate', 'cross-border-picker', 'meeting-notes'],
      );
      expect(feed.stories, hasLength(3));
      expect(feed.collections.map((collection) => collection.id).toList(), [
        'col-efficiency-picks',
        'col-go-global',
        'col-business-suite',
        'col-after-work',
      ]);
      // Collection cards resolve up to four cover apps each.
      for (final collection in feed.collections) {
        expect(collection.coverApps.length, lessThanOrEqualTo(4));
      }
      expect(feed.collections.first.coverApps, isNotEmpty);
      // Chart quick views keep the hot/free/new order and preview size.
      expect(feed.charts.map((chart) => chart.id.id).toList(),
          ['hot', 'free', 'new']);
      for (final chart in feed.charts) {
        expect(chart.apps, hasLength(kHomeChartPreviewSize));
      }
    });
  });

  group('getCollection', () {
    test('returns_the_editorial_collection_and_null_for_unknown_ids',
        () async {
      final collection = await client.getCollection('col-go-global');
      expect(collection?.title, equals('出海起步指南'));
      expect(collection?.kind, equals(AppCollectionKind.theme));
      expect(collection?.appIds, hasLength(3));

      expect(await client.getCollection('no-such-collection'), isNull);
    });
  });

  group('listCollectionApps', () {
    test('resolves_the_curated_ids_against_the_catalog', () async {
      final collectionApps = await client.listCollectionApps('col-business-suite');
      expect(collectionApps.map((app) => app.id).toList(),
          ['crm-manager', 'stock-keeper', 'ledger-lite', 'data-board']);

      expect(await client.listCollectionApps('no-such-collection'), isEmpty);
    });
  });

  group('listChart', () {
    test('hot_ranks_by_user_count', () async {
      final hot = await client.listChart(AppChartId.hot);
      expect(hot, hasLength(kChartSize));
      expect(hot.first.id, equals('game-center'));
      expect(hot[1].id, equals('code-mate'));
      // `new` stays the cross-surface wire value (Dart member: newest).
      expect(AppChartId.newest.id, equals('new'));
    });

    test('free_keeps_only_free_apps_ranked_by_rating', () async {
      final free = await client.listChart(AppChartId.free);
      expect(free, hasLength(kChartSize));
      for (final app in free) {
        expect(app.priceLabel, equals('免费'));
      }
      // Top rating 4.8 is a tie (clip-master / news-agent); Dart sort order
      // between equals is unspecified, so assert the rank boundary only.
      expect(free.first.rating, equals(4.8));
      expect(free.map((app) => app.id), containsAll(['clip-master', 'news-agent']));
    });

    test('new_ranks_by_update_date', () async {
      final newest = await client.listChart(AppChartId.newest);
      expect(newest, hasLength(kChartSize));
      expect(newest.first.id, equals('code-mate'));
      expect(newest[1].id, equals('cross-border-picker'));
    });
  });
}
