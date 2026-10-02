// Widget test: SettingsScreen drives the injected settings controller —
// appearance (system/light/dark) and locale switch immediately and persist
// through the settings store port.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';
import 'package:sdkwork_whatseek_flutter_mobile_profile/sdkwork_whatseek_flutter_mobile_profile.dart';

void main() {
  testWidgets('settings_screen_renders_appearance_language_and_about',
      (tester) async {
    final controller = WhatseekSettingsController();
    await controller.restore();
    await tester.pumpWidget(MaterialApp(home: SettingsScreen(settings: controller)));

    expect(find.text('设置'), findsOneWidget);
    expect(find.text('外观'), findsOneWidget);
    expect(find.text('跟随系统'), findsOneWidget);
    expect(find.text('浅色'), findsOneWidget);
    expect(find.text('深色'), findsOneWidget);
    expect(find.text('语言'), findsOneWidget);
    expect(find.text('简体中文'), findsOneWidget);
    expect(find.text('English'), findsOneWidget);
    expect(find.text('关于'), findsOneWidget);
    expect(find.text('版本'), findsOneWidget);
    expect(find.text(kWhatseekAppVersion), findsOneWidget);
    expect(find.text('路由契约数'), findsOneWidget);
    expect(find.text('${kWhatseekRouteTable.length}'), findsOneWidget);
  });

  testWidgets('appearance_and_locale_changes_apply_and_persist',
      (tester) async {
    final store = InMemorySettingsStore();
    final controller = WhatseekSettingsController(store: store);
    await controller.restore();
    await tester.pumpWidget(MaterialApp(home: SettingsScreen(settings: controller)));

    await tester.tap(find.text('深色'));
    await tester.pumpAndSettle();
    expect(controller.appearance, equals(WhatseekAppearance.dark));

    await tester.tap(find.text('English'));
    await tester.pumpAndSettle();
    expect(controller.locale, equals('en-US'));

    final restored = WhatseekSettingsController(store: store);
    await restored.restore();
    expect(restored.appearance, equals(WhatseekAppearance.dark));
    expect(restored.locale, equals('en-US'));
  });
}
