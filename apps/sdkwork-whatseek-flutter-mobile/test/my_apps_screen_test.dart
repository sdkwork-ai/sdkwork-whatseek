// Widget tests for 我的应用 (PRD §21): created/favorited segments, the
// publish + delete lifecycle actions (delete confirmed through the dialog),
// and the create-first empty state. Driven through the shared mock runtime;
// declaration order matters because the runtime is a singleton per isolate.
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
  testWidgets('empty_created_segment_offers_the_create_first_action',
      (tester) async {
    // Runs before any seeding, so the shared runtime has no created apps.
    await tester.pumpWidget(_host(const MyAppsScreen()));
    await tester.pumpAndSettle();

    expect(find.text('还没有创建应用'), findsOneWidget);
    expect(find.text('去创建第一个应用'), findsOneWidget);

    await tester.tap(find.text('去创建第一个应用'));
    await tester.pumpAndSettle();
    expect(find.text('pushed-target'), findsOneWidget);
  });

  testWidgets('created_segment_publishes_and_deletes_with_confirmation',
      (tester) async {
    final apps = WhatseekRuntime.instance.apps;
    await apps.createAppFromPlan('帮我做一个库存管理系统', ['商品入库', '库存盘点', '库存预警']);
    await tester.pumpWidget(_host(const MyAppsScreen()));
    await tester.pumpAndSettle();

    // The created row renders the lifecycle chip and both lifecycle actions.
    expect(find.text('库存管理系统'), findsOneWidget);
    expect(find.text('预览'), findsOneWidget);
    expect(find.textContaining('3 个模块'), findsOneWidget);

    // Publish flips the lifecycle chip and retires the action.
    await tester.tap(find.text('发布'));
    await tester.pumpAndSettle();
    expect(find.text('已发布'), findsOneWidget);
    expect(find.text('发布'), findsNothing);

    // Delete asks for confirmation first; cancelling keeps the app.
    await tester.tap(find.widgetWithText(TextButton, '删除'));
    await tester.pumpAndSettle();
    expect(find.text('删除这个应用？'), findsOneWidget);
    await tester.tap(find.widgetWithText(TextButton, '取消'));
    await tester.pumpAndSettle();
    expect(find.text('库存管理系统'), findsOneWidget);

    // Confirming removes the app and falls back to the empty state.
    await tester.tap(find.widgetWithText(TextButton, '删除'));
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(FilledButton, '删除'));
    await tester.pumpAndSettle();
    expect(find.text('库存管理系统'), findsNothing);
    expect(find.text('还没有创建应用'), findsOneWidget);
  });

  testWidgets('favorites_segment_lists_favorited_catalog_apps', (tester) async {
    await WhatseekRuntime.instance.apps.toggleFavorite('clip-master');
    await tester.pumpWidget(_host(const MyAppsScreen()));
    await tester.pumpAndSettle();

    await tester.tap(find.text('收藏的应用'));
    await tester.pumpAndSettle();
    expect(find.text('剪辑大师'), findsOneWidget);

    // A favorite row opens the catalog detail route.
    await tester.tap(find.text('剪辑大师'));
    await tester.pumpAndSettle();
    expect(find.text('pushed-target'), findsOneWidget);
  });
}
