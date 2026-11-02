/// WhatSeek tech-blue design tokens and the single Flutter theme builder
/// (THEME_DARKMODE_SPEC §6 platform mapping, §11 cross-platform token single
/// source).
///
/// Layer 1 — the 11-step brand ramp is materialized as [MaterialColor] with
/// swatch index 500 as the brand primary; the neutral ramp stays zinc.
/// Layer 2 — the §2.1 semantic roles are declared for light and dark mode and
/// mapped onto [ColorScheme] fields here, so every capability package consumes
/// `Theme.of(context).colorScheme` / `textTheme` and never restates palette hex
/// values (THEME_DARKMODE_SPEC F12).
/// Layer 3 — component tokens (app bar, tab bar, cards, fields, chips,
/// buttons) are declared once in the theme builder instead of per screen.
///
/// Visual system: **flat, borderless**. Hierarchy comes from surface contrast
/// (canvas → panel → muted fill) and spacing; nothing in the app paints a
/// hairline border, an outline or a drop shadow. Cards are solid panels with
/// no `side`/elevation, fields and chips are filled pills with the outline
/// neutralized, and the outlined-button variant is reduced to a text button so
/// no component can reintroduce a border locally. Consequently the canvas is
/// the muted neutral step (`#F4F4F5` light / `#09090B` dark) and panels are
/// white/`#18181B`, which keeps borderless blocks legible in both modes.
///
/// The values mirror the H5 surface's token file
/// (`apps/sdkwork-whatseek-h5/src/index.css`, `tech-blue` preset: Ant blue
/// brand ramp + zinc neutral ramp) so the two surfaces cannot drift; the module
/// is the Dart side of the §11 token table and is re-generated from the
/// published export once that artifact lands.
library;

import 'package:flutter/material.dart';

/// Light and dark [ThemeData] for the WhatSeek surface, plus the raw tokens
/// they are built from.
final class WhatseekTheme {
  WhatseekTheme._();

  // ---------------------------------------------------------------------------
  // Layer 1 — reference palette (`--sdk-ref-*`).
  // ---------------------------------------------------------------------------

  /// Tech-blue brand ramp, step 50 (soft fills).
  static const Color blue50 = Color(0xFFE6F4FF);

  /// Tech-blue brand ramp, step 100.
  static const Color blue100 = Color(0xFFBAE0FF);

  /// Tech-blue brand ramp, step 200.
  static const Color blue200 = Color(0xFF91CAFF);

  /// Tech-blue brand ramp, step 300.
  static const Color blue300 = Color(0xFF69B1FF);

  /// Tech-blue brand ramp, step 400 (dark-mode accent / hover).
  static const Color blue400 = Color(0xFF4096FF);

  /// Tech-blue brand ramp, step 500 — the canonical brand primary.
  static const Color blue500 = Color(0xFF1677FF);

  /// Tech-blue brand ramp, step 600 (light-mode hover).
  static const Color blue600 = Color(0xFF0958D9);

  /// Tech-blue brand ramp, step 700.
  static const Color blue700 = Color(0xFF0050B3);

  /// Tech-blue brand ramp, step 800.
  static const Color blue800 = Color(0xFF003A8C);

  /// Tech-blue brand ramp, step 900.
  static const Color blue900 = Color(0xFF002C8C);

  /// Tech-blue brand ramp, step 950.
  static const Color blue950 = Color(0xFF001D66);

  /// Neutral ramp, step 50 (canvas).
  static const Color zinc50 = Color(0xFFFAFAFA);

  /// Neutral ramp, step 100 (muted panel).
  static const Color zinc100 = Color(0xFFF4F4F5);

  /// Neutral ramp, step 200 (subtle border).
  static const Color zinc200 = Color(0xFFE4E4E7);

  /// Neutral ramp, step 300 (default border).
  static const Color zinc300 = Color(0xFFD4D4D8);

  /// Neutral ramp, step 400 (muted text).
  static const Color zinc400 = Color(0xFFA1A1AA);

  /// Neutral ramp, step 500.
  static const Color zinc500 = Color(0xFF71717A);

  /// Neutral ramp, step 600 (secondary text).
  static const Color zinc600 = Color(0xFF52525B);

  /// Neutral ramp, step 700.
  static const Color zinc700 = Color(0xFF3F3F46);

  /// Neutral ramp, step 800 (dark elevated surface).
  static const Color zinc800 = Color(0xFF27272A);

  /// Neutral ramp, step 900 (dark panel, primary text in light mode).
  static const Color zinc900 = Color(0xFF18181B);

  /// Neutral ramp, step 950 (dark canvas).
  static const Color zinc950 = Color(0xFF09090B);

  /// Brand ramp as a [MaterialColor] (swatch index 500 = `#1677FF`), the shape
  /// the §6 Flutter mapping requires.
  static const MaterialColor brand = MaterialColor(0xFF1677FF, <int, Color>{
    50: blue50,
    100: blue100,
    200: blue200,
    300: blue300,
    400: blue400,
    500: blue500,
    600: blue600,
    700: blue700,
    800: blue800,
    900: blue900,
    950: blue950,
  });

  // ---------------------------------------------------------------------------
  // Layer 2 — semantic roles (`--sdk-color-*`) per color mode.
  // ---------------------------------------------------------------------------

  static const _Palette _light = _Palette(
    canvas: zinc100,
    panel: Color(0xFFFFFFFF),
    panelMuted: Color(0xFFECEDEF),
    textPrimary: zinc900,
    textSecondary: zinc600,
    textMuted: zinc400,
    textInverse: Color(0xFFFFFFFF),
    brandPrimary: blue500,
    brandHover: blue600,
    brandSoft: blue50,
    brandOnSoft: blue700,
    brandAccent: blue400,
    borderSubtle: zinc200,
    borderDefault: zinc300,
    borderStrong: zinc400,
    danger: Color(0xFFDC2626),
    dangerSoft: Color(0xFFFEE2E2),
    dangerOnSoft: Color(0xFF991B1B),
    containerLowest: Color(0xFFFFFFFF),
    containerLow: Color(0xFFFFFFFF),
    container: Color(0xFFFFFFFF),
    containerHigh: Color(0xFFECEDEF),
    containerHighest: Color(0xFFECEDEF),
    inverseSurface: zinc800,
    inverseText: zinc50,
    inversePrimary: blue200,
  );

  static const _Palette _dark = _Palette(
    canvas: zinc950,
    panel: zinc900,
    panelMuted: zinc800,
    textPrimary: zinc50,
    textSecondary: zinc300,
    textMuted: zinc500,
    textInverse: zinc950,
    brandPrimary: blue500,
    brandHover: blue400,
    brandSoft: Color(0xFF152A4D),
    brandOnSoft: blue200,
    brandAccent: blue400,
    borderSubtle: zinc800,
    borderDefault: zinc700,
    borderStrong: zinc600,
    danger: Color(0xFFF87171),
    dangerSoft: Color(0xFF7F1D1D),
    dangerOnSoft: Color(0xFFFECACA),
    containerLowest: zinc950,
    containerLow: zinc900,
    container: zinc900,
    containerHigh: zinc800,
    containerHighest: zinc800,
    inverseSurface: zinc100,
    inverseText: zinc900,
    inversePrimary: blue600,
  );

  // ---------------------------------------------------------------------------
  // Built themes — one builder, both color modes (single `ThemeMode` resolver
  // stays at the app root in `app.dart`).
  // ---------------------------------------------------------------------------

  /// Tech-blue light theme.
  static final ThemeData light = _build(_scheme(_light, Brightness.light));

  /// Tech-blue dark theme.
  static final ThemeData dark = _build(_scheme(_dark, Brightness.dark));

  static ColorScheme _scheme(_Palette palette, Brightness brightness) {
    return ColorScheme(
      brightness: brightness,
      primary: palette.brandPrimary,
      onPrimary: palette.textInverse,
      primaryContainer: palette.brandSoft,
      onPrimaryContainer: palette.brandOnSoft,
      secondary: palette.brandHover,
      onSecondary: palette.textInverse,
      secondaryContainer: palette.brandSoft,
      onSecondaryContainer: palette.brandOnSoft,
      tertiary: palette.brandAccent,
      onTertiary: palette.textInverse,
      tertiaryContainer: palette.brandSoft,
      onTertiaryContainer: palette.brandOnSoft,
      error: palette.danger,
      onError: palette.textInverse,
      errorContainer: palette.dangerSoft,
      onErrorContainer: palette.dangerOnSoft,
      surface: palette.canvas,
      onSurface: palette.textPrimary,
      surfaceContainerLowest: palette.containerLowest,
      surfaceContainerLow: palette.containerLow,
      surfaceContainer: palette.container,
      surfaceContainerHigh: palette.containerHigh,
      surfaceContainerHighest: palette.containerHighest,
      onSurfaceVariant: palette.textSecondary,
      outline: palette.borderDefault,
      outlineVariant: palette.borderSubtle,
      shadow: const Color(0xFF000000),
      scrim: const Color(0xFF000000),
      inverseSurface: palette.inverseSurface,
      onInverseSurface: palette.inverseText,
      inversePrimary: palette.inversePrimary,
      surfaceTint: palette.brandPrimary,
    );
  }

  static ThemeData _build(ColorScheme scheme) {
    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: scheme.surface,
      canvasColor: scheme.surface,
      appBarTheme: AppBarThemeData(
        backgroundColor: scheme.surface,
        foregroundColor: scheme.onSurface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: scheme.surfaceContainer,
        surfaceTintColor: Colors.transparent,
        shadowColor: Colors.transparent,
        elevation: 0,
        indicatorColor: scheme.secondaryContainer,
        iconTheme: WidgetStateProperty.resolveWith((states) {
          return IconThemeData(
            size: 24,
            color: states.contains(WidgetState.selected)
                ? scheme.primary
                : scheme.onSurfaceVariant,
          );
        }),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          final bool selected = states.contains(WidgetState.selected);
          return TextStyle(
            fontSize: 12,
            height: 1.33,
            fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
            color: selected ? scheme.primary : scheme.onSurfaceVariant,
          );
        }),
      ),
      cardTheme: CardThemeData(
        // Flat: no border, no shadow — a card is a solid surface on the canvas
        // and separates by color contrast plus spacing only.
        color: scheme.surfaceContainerLow,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        clipBehavior: Clip.antiAlias,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      inputDecorationTheme: InputDecorationThemeData(
        // Flat filled fields: one solid tone, never an outline. The per-state
        // borders stay unset on purpose — a non-null `enabledBorder` would
        // replace the widget's own rounded border (and flatten the fill shape);
        // the transparent active indicator only neutralizes the hairline.
        filled: true,
        fillColor: scheme.surfaceContainerLow,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        activeIndicatorBorder: BorderSide.none,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        hintStyle: TextStyle(color: scheme.onSurfaceVariant),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: scheme.surfaceContainerLow,
        surfaceTintColor: Colors.transparent,
        side: BorderSide.none,
        shape: const StadiumBorder(),
        elevation: 0,
        pressElevation: 0,
        labelStyle: TextStyle(color: scheme.onSurfaceVariant),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        // The surface vocabulary is filled or plain text; an outlined variant
        // would reintroduce a hairline border.
        style: OutlinedButton.styleFrom(
          side: BorderSide.none,
          foregroundColor: scheme.primary,
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: Colors.transparent,
        thickness: 0,
        space: 0,
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: scheme.surfaceContainerLow,
        surfaceTintColor: Colors.transparent,
        shadowColor: Colors.transparent,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
      popupMenuTheme: PopupMenuThemeData(
        // Flat overflow menus (navbar "+"): solid panel, no elevation shadow.
        color: scheme.surfaceContainerLow,
        surfaceTintColor: Colors.transparent,
        shadowColor: Colors.transparent,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: TextStyle(color: scheme.onSurface, fontSize: 14),
      ),
      snackBarTheme: SnackBarThemeData(
        // Flat toast: a solid inverse block, no elevation shadow.
        backgroundColor: scheme.inverseSurface,
        contentTextStyle: TextStyle(color: scheme.onInverseSurface),
        actionTextColor: scheme.inversePrimary,
        behavior: SnackBarBehavior.floating,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: scheme.primary,
      ),
      textSelectionTheme: TextSelectionThemeData(
        cursorColor: scheme.primary,
        selectionColor: scheme.primary.withValues(alpha: 0.24),
        selectionHandleColor: scheme.primary,
      ),
    );
  }
}

/// A resolved set of §2.1 semantic roles for one color mode.
final class _Palette {
  const _Palette({
    required this.canvas,
    required this.panel,
    required this.panelMuted,
    required this.textPrimary,
    required this.textSecondary,
    required this.textMuted,
    required this.textInverse,
    required this.brandPrimary,
    required this.brandHover,
    required this.brandSoft,
    required this.brandOnSoft,
    required this.brandAccent,
    required this.borderSubtle,
    required this.borderDefault,
    required this.borderStrong,
    required this.danger,
    required this.dangerSoft,
    required this.dangerOnSoft,
    required this.containerLowest,
    required this.containerLow,
    required this.container,
    required this.containerHigh,
    required this.containerHighest,
    required this.inverseSurface,
    required this.inverseText,
    required this.inversePrimary,
  });

  final Color canvas;
  final Color panel;
  final Color panelMuted;
  final Color textPrimary;
  final Color textSecondary;
  final Color textMuted;
  final Color textInverse;
  final Color brandPrimary;
  final Color brandHover;
  final Color brandSoft;
  final Color brandOnSoft;
  final Color brandAccent;
  final Color borderSubtle;
  final Color borderDefault;
  final Color borderStrong;
  final Color danger;
  final Color dangerSoft;
  final Color dangerOnSoft;
  final Color containerLowest;
  final Color containerLow;
  final Color container;
  final Color containerHigh;
  final Color containerHighest;
  final Color inverseSurface;
  final Color inverseText;
  final Color inversePrimary;
}
