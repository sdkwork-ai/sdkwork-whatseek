/// User-preferences binding for the Flutter surface: the typed settings port
/// lives in the core package; the concrete key-value store binds here at
/// bootstrap (shared_preferences), keeping plugin classes out of feature
/// packages (FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC.md §Platform adapters).
library;

import 'dart:async';

import 'package:shared_preferences/shared_preferences.dart';

import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';

/// `shared_preferences`-backed settings store (async API).
class SharedPreferencesSettingsStore implements WhatseekSettingsStore {
  const SharedPreferencesSettingsStore();

  static final SharedPreferencesAsync _prefs = SharedPreferencesAsync();

  @override
  Future<String?> read(String key) => _prefs.getString(key);

  @override
  Future<void> write(String key, String value) => _prefs.setString(key, value);
}

/// App-wide settings (appearance + locale), bound once at bootstrap.
class WhatseekAppSettings {
  WhatseekAppSettings._();

  static final WhatseekAppSettings instance = WhatseekAppSettings._();

  final WhatseekSettingsController controller =
      WhatseekSettingsController(store: const SharedPreferencesSettingsStore());

  /// Restores persisted preferences once (fire-and-forget at bootstrap).
  Future<void> restore() => controller.restore();
}
