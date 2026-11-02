// Contract tests for the shared tech-blue theme builder
// (THEME_DARKMODE_SPEC section 6 Flutter mapping / section 11 token single
// source): the 11-step brand ramp is materialized as MaterialColor with swatch
// 500 as the brand primary, the semantic roles map onto ColorScheme for both
// color modes, the flat/borderless component policy is declared once here, and
// shell chrome (tab bar, app bar) consumes those roles instead of ad-hoc
// palette values.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';

void main() {
  group('WhatseekTheme', () {
    test('brand_ramp_materializes_as_material_color_with_500_primary', () {
      expect(WhatseekTheme.brand, isA<MaterialColor>());
      expect(WhatseekTheme.brand.shade500, const Color(0xFF1677FF));
      expect(WhatseekTheme.brand.shade50, WhatseekTheme.blue50);
      expect(WhatseekTheme.brand[950], WhatseekTheme.blue950);
    });

    test('light_scheme_maps_the_tech_blue_semantic_roles', () {
      final ColorScheme scheme = WhatseekTheme.light.colorScheme;
      expect(scheme.brightness, Brightness.light);
      // Brand roles stay saturated: primary is the exact brand step, not a
      // desaturated seed-derived tone.
      expect(scheme.primary, WhatseekTheme.blue500);
      expect(scheme.secondaryContainer, WhatseekTheme.blue50);
      expect(scheme.onSecondaryContainer, WhatseekTheme.blue700);
      // Flat surface ladder: muted canvas -> white panel -> muted fill.
      expect(scheme.surface, WhatseekTheme.zinc100);
      expect(scheme.surfaceContainerLow, const Color(0xFFFFFFFF));
      expect(scheme.surfaceContainerHigh, const Color(0xFFECEDEF));
      expect(scheme.onSurface, WhatseekTheme.zinc900);
      expect(scheme.outlineVariant, WhatseekTheme.zinc200);
    });

    test('every_component_ships_borderless_flat_surfaces', () {
      for (final ThemeData theme in <ThemeData>[
        WhatseekTheme.light,
        WhatseekTheme.dark,
      ]) {
        // Cards: solid panel, no hairline side, no shadow.
        final ShapeBorder cardShape = theme.cardTheme.shape!;
        expect(cardShape, isA<RoundedRectangleBorder>());
        expect((cardShape as RoundedRectangleBorder).side, BorderSide.none);
        expect(theme.cardTheme.elevation, 0);
        expect(theme.navigationBarTheme.elevation, 0);

        // Fields are filled pills; the outline is neutralized globally so a
        // per-widget OutlineInputBorder can only contribute its radius. The
        // per-state borders stay unset: a non-null enabledBorder would replace
        // the widget's rounded border and flatten the fill into a rectangle.
        expect(theme.inputDecorationTheme.filled, isTrue);
        expect(theme.inputDecorationTheme.border!.borderSide, BorderSide.none);
        expect(theme.inputDecorationTheme.enabledBorder, isNull);
        expect(theme.inputDecorationTheme.focusedBorder, isNull);
        expect(
          theme.inputDecorationTheme.activeIndicatorBorder,
          BorderSide.none,
        );
        expect(
          theme.inputDecorationTheme.fillColor,
          theme.colorScheme.surfaceContainerLow,
        );

        // Chips and the outlined-button variant never paint a border.
        expect(theme.chipTheme.side, BorderSide.none);
        expect(
          theme.outlinedButtonTheme.style?.side?.resolve(<WidgetState>{}),
          BorderSide.none,
        );

        // Dividers are gone: separation comes from surface contrast.
        expect(theme.dividerTheme.color, Colors.transparent);

        // Overlays stay shadowless too (flat, not elevated).
        expect(theme.dialogTheme.elevation, 0);
        expect(theme.snackBarTheme.elevation, 0);
        expect(theme.popupMenuTheme.elevation, 0);
      }
    });

    test('dark_scheme_keeps_the_tech_blue_hue_and_dark_surfaces', () {
      final ColorScheme scheme = WhatseekTheme.dark.colorScheme;
      expect(scheme.brightness, Brightness.dark);
      expect(scheme.primary, WhatseekTheme.blue500);
      expect(scheme.surface, WhatseekTheme.zinc950);
      expect(scheme.surfaceContainerLow, WhatseekTheme.zinc900);
      expect(scheme.onSurface, WhatseekTheme.zinc50);
    });

    test('app_bar_and_tab_bar_take_their_colors_from_the_roles', () {
      final ThemeData light = WhatseekTheme.light;
      expect(
        light.appBarTheme.backgroundColor,
        light.colorScheme.surface,
      );
      expect(
        light.navigationBarTheme.indicatorColor,
        light.colorScheme.secondaryContainer,
      );
      final TextStyle? selectedLabel = light.navigationBarTheme.labelTextStyle
          ?.resolve(<WidgetState>{WidgetState.selected});
      expect(selectedLabel?.color, light.colorScheme.primary);
    });

    testWidgets('selected_tab_icon_and_label_paint_in_the_brand_color',
        (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: WhatseekTheme.light,
          home: Scaffold(
            bottomNavigationBar: NavigationBar(
              selectedIndex: 1,
              destinations: const <NavigationDestination>[
                NavigationDestination(
                  icon: Icon(Icons.home_outlined),
                  selectedIcon: Icon(Icons.home),
                  label: 'a',
                ),
                NavigationDestination(
                  icon: Icon(Icons.apps_outlined),
                  selectedIcon: Icon(Icons.apps),
                  label: 'b',
                ),
              ],
            ),
          ),
        ),
      );

      final IconThemeData selectedIconTheme =
          IconTheme.of(tester.element(find.byIcon(Icons.apps)));
      expect(selectedIconTheme.color, WhatseekTheme.blue500);

      final IconThemeData unselectedIconTheme =
          IconTheme.of(tester.element(find.byIcon(Icons.home_outlined)));
      expect(
        unselectedIconTheme.color,
        WhatseekTheme.light.colorScheme.onSurfaceVariant,
      );
    });

    testWidgets('a_per_widget_rounded_field_keeps_its_shape_without_a_hairline',
        (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: WhatseekTheme.light,
          home: Scaffold(
            body: TextField(
              decoration: InputDecoration(
                hintText: 'x',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
                isDense: true,
              ),
            ),
          ),
        ),
      );

      final InputDecorator decorator =
          tester.widget<InputDecorator>(find.byType(InputDecorator));
      // The widget's rounded border must survive; only the hairline is gone.
      expect(decorator.decoration.border, isA<OutlineInputBorder>());
      expect(
        (decorator.decoration.border! as OutlineInputBorder).borderRadius,
        BorderRadius.circular(24),
      );
      expect(decorator.decoration.filled, isTrue);
      expect(decorator.decoration.enabledBorder, isNull);
    });
  });
}
