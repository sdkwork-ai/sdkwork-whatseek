// Navbar "+" entry of 应用中心: the AI page-creation menu. Every entry must
// open the create route seeded with its page-type requirement, so the user
// lands in the generation flow with a concrete brief instead of a blank form.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_whatseek_flutter_mobile_apps/sdkwork_whatseek_flutter_mobile_apps.dart';
import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';

/// Captures what the push actually asked for.
class _RouteProbe {
  String? name;
  Object? arguments;
}

Widget _host(_RouteProbe probe) => MaterialApp(
      theme: WhatseekTheme.light,
      onGenerateRoute: (settings) {
        probe.name = settings.name;
        probe.arguments = settings.arguments;
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (_) => const Scaffold(body: Text('pushed-target')),
        );
      },
      home: const AppsHomeScreen(),
    );

void main() {
  group('AppsHomeScreen create menu', () {
    testWidgets('navbar_plus_opens_the_ai_page_creation_menu', (tester) async {
      await tester.pumpWidget(_host(_RouteProbe()));
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(Icons.add));
      await tester.pumpAndSettle();

      expect(find.text('创建企业官网'), findsOneWidget);
      expect(find.text('新建网页'), findsOneWidget);
      expect(find.text('创建活动落地页'), findsOneWidget);
      expect(find.text('创建个人主页'), findsOneWidget);
    });

    testWidgets('company_website_entry_opens_create_with_a_requirement_seed',
        (tester) async {
      final _RouteProbe probe = _RouteProbe();
      await tester.pumpWidget(_host(probe));
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(Icons.add));
      await tester.pumpAndSettle();
      await tester.tap(find.text('创建企业官网'));
      await tester.pumpAndSettle();

      expect(probe.name, 'app.whatseek.apps.create');
      expect(probe.arguments, isA<String>());
      expect(probe.arguments! as String, contains('企业官网'));
    });

    testWidgets('new_web_page_entry_seeds_the_generic_page_requirement',
        (tester) async {
      final _RouteProbe probe = _RouteProbe();
      await tester.pumpWidget(_host(probe));
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(Icons.add));
      await tester.pumpAndSettle();
      await tester.tap(find.text('新建网页'));
      await tester.pumpAndSettle();

      expect(probe.name, 'app.whatseek.apps.create');
      expect(probe.arguments! as String, contains('网页'));
    });
  });
}
