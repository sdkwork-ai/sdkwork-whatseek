// Tab icon fill-state contract (APP_FLUTTER_UI_SPEC §5): the selected tab MUST
// paint a filled glyph while the others stay outline, so every tab pairs an
// outline codepoint with a visually distinct filled one. Icon families that only
// ship an outline drawing fail the rule — `grid_view` and `apps` render their
// filled and outlined codepoints as the same hollow squares, which is why 应用
// uses the `widgets` family.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';
import 'package:sdkwork_whatseek_flutter_mobile_shell/sdkwork_whatseek_flutter_mobile_shell.dart';

void main() {
  group('kTabIcons', () {
    test('every_tab_root_declares_an_outline_and_filled_pair', () {
      for (final route in kTabRootRoutes) {
        expect(kTabIcons[route.tab!], isNotNull, reason: '${route.tab}');
      }
      expect(kTabIcons.length, kTabRootRoutes.length);
    });

    test('selected_glyph_is_a_distinct_codepoint_from_the_outline_glyph', () {
      kTabIcons.forEach((tab, pair) {
        expect(
          pair.$1.codePoint,
          isNot(pair.$2.codePoint),
          reason: '$tab must not reuse one glyph for both states',
        );
      });
    });

    test('apps_tab_uses_a_family_that_ships_a_filled_variant', () {
      expect(kTabIcons[TabId.apps], (Icons.widgets_outlined, Icons.widgets));
      // Guard against regressing to the identical-filled grid_view/apps pairs.
      expect(kTabIcons[TabId.apps]!.$1, isNot(Icons.grid_view_outlined));
      expect(kTabIcons[TabId.apps]!.$2, isNot(Icons.grid_view));
      expect(kTabIcons[TabId.apps]!.$1, isNot(Icons.apps_outlined));
      expect(kTabIcons[TabId.apps]!.$2, isNot(Icons.apps));
    });

    testWidgets('selected_tab_paints_the_filled_glyph_only', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: WhatseekTheme.light,
          home: WhatseekShell(
            destinations: [
              for (final route in kTabRootRoutes)
                (
                  route.tab!.name,
                  kTabIcons[route.tab!]!.$1,
                  kTabIcons[route.tab!]!.$2,
                ),
            ],
            currentIndex: TabId.apps.index,
            onDestinationSelected: (_) {},
            child: const SizedBox(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // 应用 is selected: the filled glyph paints, its outline does not.
      expect(find.byIcon(Icons.apps), findsOneWidget);
      expect(find.byIcon(Icons.apps_outlined), findsNothing);
      // Other tabs stay on their outline glyph.
      expect(find.byIcon(Icons.person_outline), findsOneWidget);
      expect(find.byIcon(Icons.person), findsNothing);
    });
  });
}
