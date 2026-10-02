/// User preferences for the Flutter surface (THEME_DARKMODE_SPEC analog +
/// I18N_SPEC §7): appearance (theme mode) and locale, restored from a
/// key-value store and changed live from the settings screen.
library;

import 'package:flutter/foundation.dart';

/// App display version surfaced by the settings About section.
const String kWhatseekAppVersion = '0.1.0';

/// Locales shipped by the Flutter surface (I18N_SPEC: normalized BCP 47).
const List<String> kWhatseekLocales = ['zh-CN', 'en-US'];

/// Appearance options driving `MaterialApp.themeMode`.
enum WhatseekAppearance { system, light, dark }

/// Persistence port for user preferences (ENVIRONMENT/CONFIG separation:
/// concrete plugin bindings live at bootstrap, never in the core package).
abstract interface class WhatseekSettingsStore {
  Future<String?> read(String key);

  Future<void> write(String key, String value);
}

/// In-memory store — the default when no persistence is bound (tests).
class InMemorySettingsStore implements WhatseekSettingsStore {
  final Map<String, String> _values = {};

  @override
  Future<String?> read(String key) async => _values[key];

  @override
  Future<void> write(String key, String value) async {
    _values[key] = value;
  }
}

/// ChangeNotifier holding the appearance + locale preferences. Screens read
/// it through constructor injection from the bootstrap; changes notify so the
/// shell rebuilds `MaterialApp` (themeMode/locale) immediately.
class WhatseekSettingsController extends ChangeNotifier {
  WhatseekSettingsController({WhatseekSettingsStore? store})
      : _store = store ?? InMemorySettingsStore();

  static const String _appearanceKey = 'whatseek.settings.appearance';
  static const String _localeKey = 'whatseek.settings.locale';

  final WhatseekSettingsStore _store;

  WhatseekAppearance _appearance = WhatseekAppearance.system;
  String _locale = kWhatseekLocales.first;
  bool _restored = false;

  WhatseekAppearance get appearance => _appearance;

  /// Active BCP 47 locale tag (`zh-CN` / `en-US`).
  String get locale => _locale;

  bool get restored => _restored;

  /// Restores persisted preferences once; safe to call multiple times.
  Future<void> restore() async {
    if (_restored) {
      return;
    }
    final appearance = await _store.read(_appearanceKey);
    final locale = await _store.read(_localeKey);
    _appearance = switch (appearance) {
      'light' => WhatseekAppearance.light,
      'dark' => WhatseekAppearance.dark,
      'system' => WhatseekAppearance.system,
      _ => WhatseekAppearance.system,
    };
    if (locale != null && kWhatseekLocales.contains(locale)) {
      _locale = locale;
    }
    _restored = true;
    notifyListeners();
  }

  /// Persists and applies the appearance immediately.
  Future<void> setAppearance(WhatseekAppearance value) async {
    if (_appearance == value) {
      return;
    }
    _appearance = value;
    notifyListeners();
    await _store.write(_appearanceKey, value.name);
  }

  /// Persists and applies the locale immediately (BCP 47 tag).
  Future<void> setLocale(String value) async {
    if (!kWhatseekLocales.contains(value) || _locale == value) {
      return;
    }
    _locale = value;
    notifyListeners();
    await _store.write(_localeKey, value);
  }
}
