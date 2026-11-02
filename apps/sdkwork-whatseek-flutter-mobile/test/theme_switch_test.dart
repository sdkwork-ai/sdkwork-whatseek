// Regression guard for live color-mode swaps (THEME_DARKMODE_SPEC §3.2): the
// tab roots are `const` widgets composed once by the shell, so a screen that
// captures theme-derived colors into deferred builders (ListView.builder item
// closures) must own the theme dependency itself. Without it the 今日精选
// stories and 编辑精选 covers keep the previous mode's palette after a switch.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_whatseek_flutter_mobile_apps/sdkwork_whatseek_flutter_mobile_apps.dart';
import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';

/// Background of the first 今日精选 story card (tinted from `primary` and
/// `surface` inside the rail's deferred item builder).
Color? _storyCardColor(WidgetTester tester) {
  final Finder container = find
      .ancestor(
        of: find.text('一句话，生成一个应用'),
        matching: find.byType(Container),
      )
      .first;
  return (tester.widget<Container>(container).decoration as BoxDecoration?)
      ?.color;
}

/// Title color captured from `textTheme` inside the same deferred builder.
Color? _storyTitleColor(WidgetTester tester) {
  return tester.widget<Text>(find.text('一句话，生成一个应用')).style?.color;
}

void main() {
  group('live color-mode swap', () {
    testWidgets('appstore_home_repaints_captured_colors_on_a_mode_switch',
        (tester) async {
      final ValueNotifier<ThemeMode> mode =
          ValueNotifier<ThemeMode>(ThemeMode.light);
      addTearDown(mode.dispose);

      await tester.pumpWidget(
        ValueListenableBuilder<ThemeMode>(
          valueListenable: mode,
          builder: (context, value, child) => MaterialApp(
            theme: WhatseekTheme.light,
            darkTheme: WhatseekTheme.dark,
            themeMode: value,
            home: const AppsHomeScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      final Color? lightCard = _storyCardColor(tester);
      final Color? lightTitle = _storyTitleColor(tester);
      expect(lightCard, isNotNull);

      mode.value = ThemeMode.dark;
      await tester.pumpAndSettle();
      expect(_storyCardColor(tester), isNot(lightCard));
      expect(_storyTitleColor(tester), isNot(lightTitle));

      mode.value = ThemeMode.light;
      await tester.pumpAndSettle();
      expect(_storyCardColor(tester), lightCard);
      expect(_storyTitleColor(tester), lightTitle);
    });
  });
}
