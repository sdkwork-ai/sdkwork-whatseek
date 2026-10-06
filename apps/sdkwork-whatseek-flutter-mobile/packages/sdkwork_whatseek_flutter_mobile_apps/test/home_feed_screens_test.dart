// Widget tests for the appstore home feed port (PRD §4/§5.1 编辑流):
// AppsHomeScreen feed navigation (charts more-link, collection card, hero
// slide), AppChartsScreen (three ranked charts) and AppCollectionScreen
// (success / not-found states) — Material adaptation of the H5 feed.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_whatseek_flutter_mobile_apps/sdkwork_whatseek_flutter_mobile_apps.dart';

Widget _host(Widget child) => MaterialApp(
      onGenerateRoute: (settings) => MaterialPageRoute<void>(
        settings: settings,
        builder: (_) => const Scaffold(body: Text('pushed-target')),
      ),
      home: child,
    );

void main() {
  group('AppsHomeScreen feed', () {
    testWidgets('charts_more_link_opens_the_charts_route', (tester) async {
      await tester.pumpWidget(_host(const AppsHomeScreen()));
      await tester.pumpAndSettle();

      await tester.dragUntilVisible(
        find.text('查看完整榜单'),
        find.byType(ListView).first,
        const Offset(0, -150),
      );
      await tester.tap(find.text('查看完整榜单'));
      await tester.pumpAndSettle();
      expect(find.text('pushed-target'), findsOneWidget);
    });

    testWidgets('chart_quick_view_row_opens_the_app_detail_route',
        (tester) async {
      await tester.pumpWidget(_host(const AppsHomeScreen()));
      await tester.pumpAndSettle();

      await tester.dragUntilVisible(
        find.text('棋牌游戏中心'),
        find.byType(ListView).first,
        const Offset(0, -150),
      );
      await tester.tap(find.text('棋牌游戏中心').first);
      await tester.pumpAndSettle();
      expect(find.text('pushed-target'), findsOneWidget);
    });

    testWidgets('collection_card_opens_the_collection_route', (tester) async {
      await tester.pumpWidget(_host(const AppsHomeScreen()));
      await tester.pumpAndSettle();

      await tester.dragUntilVisible(
        find.text('提升效率的 6 款工具'),
        find.byType(ListView).first,
        const Offset(0, -150),
      );
      await tester.pumpAndSettle();
      // dragUntilVisible can overshoot past the viewport edge; settle the
      // card fully on screen before tapping.
      await tester.ensureVisible(find.text('提升效率的 6 款工具'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('提升效率的 6 款工具'));
      await tester.pumpAndSettle();
      expect(find.text('pushed-target'), findsOneWidget);
    });

    testWidgets('my_apps_quick_links_open_the_my_apps_route',
        (tester) async {
      await tester.pumpWidget(_host(const AppsHomeScreen()));
      await tester.pumpAndSettle();

      await tester.tap(find.text('我的应用'));
      await tester.pumpAndSettle();
      expect(find.text('pushed-target'), findsOneWidget);
    });
  });

  group('AppChartsScreen', () {
    testWidgets('renders_the_three_ranked_charts', (tester) async {
      await tester.pumpWidget(_host(const AppChartsScreen()));
      await tester.pumpAndSettle();

      expect(find.text('排行榜'), findsOneWidget);
      expect(find.text('热门榜'), findsOneWidget);
      // 热门榜 leads with the highest user count (棋牌游戏中心, 6.8万).
      expect(find.text('棋牌游戏中心'), findsOneWidget);
      expect(find.text('1'), findsOneWidget);
      // 免费榜 / 新品榜 sit below the fold.
      await tester.dragUntilVisible(
        find.text('免费榜'),
        find.byType(ListView).first,
        const Offset(0, -150),
      );
      expect(find.text('免费榜'), findsOneWidget);
      await tester.dragUntilVisible(
        find.text('新品榜'),
        find.byType(ListView).first,
        const Offset(0, -150),
      );
      expect(find.text('新品榜'), findsOneWidget);
    });
  });

  group('AppCollectionScreen', () {
    testWidgets('renders_the_collection_header_and_curated_apps',
        (tester) async {
      await tester.pumpWidget(_host(const AppCollectionScreen(
        collectionId: 'col-go-global',
      )));
      await tester.pumpAndSettle();

      expect(find.text('出海起步指南'), findsWidgets);
      expect(find.text('选品、建站、内容营销的入门组合。'), findsOneWidget);
      expect(find.text('跨境选品助手'), findsOneWidget);
      expect(find.text('独立站搭建器'), findsOneWidget);
      expect(find.text('小红书标题生成器'), findsOneWidget);
    });

    testWidgets('unknown_collection_ids_render_the_not_found_state',
        (tester) async {
      await tester.pumpWidget(_host(const AppCollectionScreen(
        collectionId: 'no-such-collection',
      )));
      await tester.pumpAndSettle();

      expect(find.text('合集不存在'), findsOneWidget);
    });
  });
}
