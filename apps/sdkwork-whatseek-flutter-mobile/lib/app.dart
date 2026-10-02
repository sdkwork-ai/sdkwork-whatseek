import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';
import 'package:sdkwork_whatseek_flutter_mobile_shell/sdkwork_whatseek_flutter_mobile_shell.dart';

import 'auth_gate.dart';
import 'bootstrap/routes.dart';
import 'bootstrap/runtime.dart';

/// Root application widget (PRD §54): five bottom tabs, chat first. Detail
/// routes are composed in `bootstrap/routes.dart` — single owner for route
/// composition. Light/dark themes seed from the H5 brand color; appearance
/// and locale follow the persisted settings controller.
class WhatseekApp extends StatefulWidget {
  const WhatseekApp({super.key, this.settings});

  /// Settings override for tests; defaults to the bootstrap controller.
  final WhatseekSettingsController? settings;

  @override
  State<WhatseekApp> createState() => _WhatseekAppState();
}

class _WhatseekAppState extends State<WhatseekApp> {
  late final WhatseekSettingsController _settings =
      widget.settings ?? WhatseekBootstrap.bootstrap().settings.controller;

  int _currentIndex = 0;

  /// H5 brand palette seed (`--brand`: #2563eb).
  static const Color _brand = Color(0xFF2563EB);

  static const Map<TabId, IconData> _tabIcons = {
    TabId.chat: Icons.auto_awesome,
    TabId.apps: Icons.grid_view,
    TabId.contacts: Icons.people,
    TabId.messages: Icons.chat_bubble,
    TabId.profile: Icons.person,
  };

  @override
  void initState() {
    super.initState();
    _settings.addListener(_onSettingsChanged);
    _settings.restore();
  }

  @override
  void dispose() {
    _settings.removeListener(_onSettingsChanged);
    super.dispose();
  }

  void _onSettingsChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  Route<dynamic>? _onGenerateRoute(RouteSettings settings) {
    final builders = whatseekDetailRoutes();
    final builder = builders[settings.name];
    if (builder == null) {
      return null;
    }
    return MaterialPageRoute<void>(settings: settings, builder: builder);
  }

  /// Brand-seeded Material 3 theme for both brightnesses.
  static ThemeData _theme(Brightness brightness) => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: _brand, brightness: brightness),
      );

  static Locale _localeOf(String tag) {
    final parts = tag.split('-');
    return parts.length > 1 ? Locale(parts[0], parts[1]) : Locale(parts[0]);
  }

  static ThemeMode _themeModeOf(WhatseekAppearance appearance) => switch (appearance) {
        WhatseekAppearance.system => ThemeMode.system,
        WhatseekAppearance.light => ThemeMode.light,
        WhatseekAppearance.dark => ThemeMode.dark,
      };

  @override
  Widget build(BuildContext context) {
    return AuthGate(
      child: MaterialApp(
        onGenerateTitle: (context) => WhatseekShellStrings.of(context, 'nav.brand'),
        theme: _theme(Brightness.light),
        darkTheme: _theme(Brightness.dark),
        themeMode: _themeModeOf(_settings.appearance),
        locale: _localeOf(_settings.locale),
        supportedLocales: const [Locale('zh', 'CN'), Locale('en', 'US')],
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        onGenerateRoute: _onGenerateRoute,
        // One runtime i18n provider above the navigator (I18N_SPEC §7): every
        // pushed route re-resolves its fragments when the locale changes.
        builder: (context, child) =>
            WhatseekI18n(locale: _settings.locale, child: child!),
        home: Builder(
          builder: (context) {
            final tabRoutes = whatseekTabRoutes();
            return WhatseekShell(
              destinations: [
                for (final route in kTabRootRoutes)
                  (
                    WhatseekCoreStrings.of(context, 'shell.tab.${route.tab!.name}'),
                    _tabIcons[route.tab!]!,
                  ),
              ],
              currentIndex: _currentIndex,
              onDestinationSelected: (index) => setState(() {
                _currentIndex = index;
              }),
              child: IndexedStack(
                index: _currentIndex,
                children: [
                  for (final route in kTabRootRoutes) tabRoutes[route.id]!(context),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
