// Widget tests for the commercial-delivery screens: AppsHomeScreen (create
// entry, appstore home feed sections, category chips, recent strip),
// AppsSearchScreen (success/empty/push-to-detail), AppRunnerScreen (success /
// visitor permission-denied / not-found), AppCreateScreen (modify step) and
// AppDetailScreen (favorite toggle) — driven through the injected mock clients.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_whatseek_flutter_mobile_apps/sdkwork_whatseek_flutter_mobile_apps.dart';
import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';

Widget _host(Widget child) => MaterialApp(
      onGenerateRoute: (settings) => MaterialPageRoute<void>(
        settings: settings,
        builder: (_) => const Scaffold(body: Text('pushed-target')),
      ),
      home: child,
    );

void main() {
  group('AppsHomeScreen', () {
    testWidgets('renders_the_appstore_home_feed_editorial_sections',
        (tester) async {
      await WhatseekRuntime.instance.apps.recordRecent('clip-master');
      await tester.pumpWidget(_host(const AppsHomeScreen()));
      await tester.pumpAndSettle();

      expect(find.text('AI 创建应用'), findsOneWidget);
      expect(find.text('说一句需求，帮你生成一个可用的应用'), findsOneWidget);
      // Hero carousel lead slide + story rail (feed order, PRD §5.1).
      expect(find.text('AI 编程季'), findsOneWidget);
      expect(find.text('今日精选'), findsOneWidget);
      // 编辑精选 / 为你推荐 / 榜单速览 / chips / 最近使用 sit below the fold.
      await tester.dragUntilVisible(
        find.text('编辑精选'),
        find.byType(ListView).first,
        const Offset(0, -150),
      );
      expect(find.text('编辑精选'), findsOneWidget);
      await tester.dragUntilVisible(
        find.text('为你推荐'),
        find.byType(ListView).first,
        const Offset(0, -150),
      );
      expect(find.text('为你推荐'), findsOneWidget);
      await tester.dragUntilVisible(
        find.text('榜单速览'),
        find.byType(ListView).first,
        const Offset(0, -150),
      );
      expect(find.text('榜单速览'), findsOneWidget);
      expect(find.text('查看完整榜单'), findsOneWidget);
      // Category chips carry their localized labels.
      await tester.dragUntilVisible(
        find.text('⚡ 效率'),
        find.byType(ListView).first,
        const Offset(0, -150),
      );
      expect(find.text('⚡ 效率'), findsOneWidget);
      await tester.dragUntilVisible(
        find.text('最近使用'),
        find.byType(ListView).first,
        const Offset(0, -150),
      );
      expect(find.text('最近使用'), findsOneWidget);
    });

    testWidgets('category_chip_opens_the_search_route', (tester) async {
      await tester.pumpWidget(_host(const AppsHomeScreen()));
      await tester.pumpAndSettle();

      await tester.dragUntilVisible(
        find.text('⚡ 效率'),
        find.byType(ListView).first,
        const Offset(0, -150),
      );
      await tester.pumpAndSettle();
      // dragUntilVisible can overshoot past the viewport edge; settle the
      // chip fully on screen before tapping.
      await tester.ensureVisible(find.text('⚡ 效率'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('⚡ 效率'));
      await tester.pumpAndSettle();
      expect(find.text('pushed-target'), findsOneWidget);
    });

    testWidgets('ai_create_entry_opens_the_create_route', (tester) async {
      await tester.pumpWidget(_host(const AppsHomeScreen()));
      await tester.pumpAndSettle();

      await tester.tap(find.text('AI 创建应用'));
      await tester.pumpAndSettle();
      expect(find.text('pushed-target'), findsOneWidget);
    });
  });

  group('AppsSearchScreen', () {
    testWidgets('search_renders_scored_results_with_rating_and_price',
        (tester) async {
      await tester.pumpWidget(_host(const AppsSearchScreen(initialQuery: '视频剪辑')));
      await tester.pumpAndSettle();

      expect(find.text('找到 1 个应用'), findsOneWidget);
      expect(find.text('剪辑大师'), findsOneWidget);
      expect(find.text('匹配 视频剪辑'), findsOneWidget);
      expect(find.text('★ 4.8'), findsOneWidget);
      expect(find.text('免费'), findsOneWidget);
    });

    testWidgets('empty_results_show_the_empty_state_and_create_fallback',
        (tester) async {
      await tester.pumpWidget(_host(const AppsSearchScreen()));
      await tester.pumpAndSettle();
      await tester.enterText(find.byType(TextField), '量子折叠机');
      await tester.testTextInput.receiveAction(TextInputAction.done);
      await tester.pumpAndSettle();

      expect(find.text('没有找到合适的应用'), findsOneWidget);
      expect(find.text('没关系——告诉问寻你想做什么，AI 可以直接帮你创建一个。'), findsOneWidget);
      expect(find.text('让 AI 帮你创建一个'), findsOneWidget);
    });

    testWidgets('tapping_a_result_pushes_the_apps_detail_route',
        (tester) async {
      await tester.pumpWidget(_host(const AppsSearchScreen(initialQuery: '视频剪辑')));
      await tester.pumpAndSettle();

      await tester.tap(find.text('剪辑大师'));
      await tester.pumpAndSettle();

      expect(find.text('pushed-target'), findsOneWidget);
    });
  });

  group('AppRunnerScreen', () {
    testWidgets('open_success_renders_the_runtime_preview_panel',
        (tester) async {
      await tester.pumpWidget(_host(const AppRunnerScreen(appId: 'clip-master')));
      await tester.pumpAndSettle();

      expect(find.text('剪辑大师 · 运行中'), findsOneWidget);
      expect(find.text('剪辑大师'), findsWidgets);
      expect(find.text('这是应用运行预览。正式版将在云端沙箱中运行真实应用。'), findsOneWidget);
    });

    testWidgets('enterprise_app_denies_visitor_sessions_with_a_back_action',
        (tester) async {
      await tester.pumpWidget(_host(const AppRunnerScreen(
        appId: 'crm-manager',
        isVisitor: true,
      )));
      await tester.pumpAndSettle();

      expect(find.text('没有权限'), findsOneWidget);
      expect(find.text('返回'), findsOneWidget);
    });

    testWidgets('named_sessions_open_enterprise_apps', (tester) async {
      await tester.pumpWidget(_host(const AppRunnerScreen(
        appId: 'crm-manager',
        isVisitor: false,
      )));
      await tester.pumpAndSettle();

      expect(find.text('客户管家 CRM · 运行中'), findsOneWidget);
      expect(find.text('没有权限'), findsNothing);
    });

    testWidgets('unknown_apps_render_the_not_found_state', (tester) async {
      await tester.pumpWidget(_host(const AppRunnerScreen(appId: 'no-such-app')));
      await tester.pumpAndSettle();

      expect(find.text('应用不存在'), findsOneWidget);
    });
  });

  group('AppCreateScreen', () {
    testWidgets('preview_accepts_follow_up_instructions_and_refreshes',
        (tester) async {
      await tester.pumpWidget(_host(const AppCreateScreen()));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField).first, '帮我做一个库存管理系统');
      await tester.tap(find.text('生成方案'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('直接生成'));
      await tester.pumpAndSettle();
      expect(find.textContaining('5 个模块'), findsOneWidget);

      // The instruction field is the second TextField; applying it bumps the
      // module count and the version (H5 applyInstruction semantics).
      await tester.enterText(find.byType(TextField).at(1), '增加订单管理');
      await tester.tap(find.text('修改'));
      await tester.pumpAndSettle();

      expect(find.textContaining('6 个模块'), findsOneWidget);
      expect(find.textContaining('v0.1.1'), findsOneWidget);
      // The publish action survives the modification (lifecycle unchanged).
      await tester.dragUntilVisible(
        find.text('发布到我的应用'),
        find.byType(ListView).first,
        const Offset(0, -150),
      );
      expect(find.text('发布到我的应用'), findsOneWidget);
    });
  });

  group('AppDetailScreen', () {
    testWidgets('favorite_toggle_flips_the_icon_state', (tester) async {
      await tester.pumpWidget(_host(const AppDetailScreen(appId: 'image-studio')));
      await tester.pumpAndSettle();

      expect(find.byTooltip('收藏'), findsOneWidget);
      await tester.tap(find.byTooltip('收藏'));
      await tester.pumpAndSettle();
      expect(find.byTooltip('已收藏'), findsOneWidget);

      // Tapping again restores the unfavorited state.
      await tester.tap(find.byTooltip('已收藏'));
      await tester.pumpAndSettle();
      expect(find.byTooltip('收藏'), findsOneWidget);
    });
  });
}
