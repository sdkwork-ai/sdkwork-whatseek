// Widget tests for the three commercial-delivery screens: AppsSearchScreen
// (success/empty/push-to-detail) and AppRunnerScreen (success / visitor
// permission-denied / not-found), driven through the injected mock clients.
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
}
