import 'package:flutter/material.dart';

/// Runtime i18n provider for the WhatSeek Flutter surface (I18N_SPEC §7):
/// one provider owned by the shell/bootstrap; feature packages resolve their
/// fragments through it and never read the platform locale themselves.
///
/// The provider sits above the navigator (`MaterialApp.builder`), so every
/// pushed route rebuilds when the locale changes.
class WhatseekI18n extends InheritedWidget {
  const WhatseekI18n({super.key, required this.locale, required super.child});

  /// Active BCP 47 tag (`zh-CN` / `en-US`).
  final String locale;

  /// Ambient locale for [context]; `zh-CN` when no provider is above
  /// (widget tests pump screens without the shell).
  static String localeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<WhatseekI18n>()?.locale ??
      'zh-CN';

  @override
  bool updateShouldNotify(WhatseekI18n oldWidget) => oldWidget.locale != locale;
}

/// One package's string fragments as flat `section.key` maps per locale.
///
/// The Dart maps mirror the authored JSON fragments under
/// `lib/src/i18n/<locale>/whatseek/<capability>/strings.json`
/// (APP_FLUTTER_UI_SPEC §i18n layout); `test/i18n_layout_test.dart` parses
/// the fragments and fails on drift. Lookups fall back to the zh-CN default.
class WhatseekStringSet {
  const WhatseekStringSet(this._maps);

  final Map<String, Map<String, String>> _maps;

  /// Resolve [key] for [locale], interpolate `{{param}}` placeholders, and
  /// fall back to zh-CN; unknown keys resolve to the key itself so raw
  /// service text (H5 `defaultValue` semantics) passes through.
  ///
  /// Service keys arrive fully namespaced (`whatseek.<capability>.<section>.<key>`,
  /// e.g. chat reply `contentKey`s) while fragments store `section.key`, so a
  /// missed exact lookup retries progressively shorter suffixes.
  String resolve(
    String locale,
    String key, [
    Map<String, Object?> params = const {},
  ]) {
    var template = _lookup(locale, key);
    if (template == null && key.contains('.')) {
      var candidate = key;
      while (candidate.contains('.')) {
        candidate = candidate.substring(candidate.indexOf('.') + 1);
        template = _lookup(locale, candidate);
        if (template != null) {
          break;
        }
      }
    }
    template ??= key;
    if (params.isEmpty) {
      return template;
    }
    var result = template;
    for (final entry in params.entries) {
      result = result.replaceAll('{{${entry.key}}}', '${entry.value}');
    }
    return result;
  }

  String? _lookup(String locale, String key) =>
      _maps[locale]?[key] ?? _maps['zh-CN']?[key] ?? _maps['en-US']?[key];

  /// Resolve [key] against the ambient [WhatseekI18n] locale.
  String of(
    BuildContext context,
    String key, [
    Map<String, Object?> params = const {},
  ]) =>
      resolve(WhatseekI18n.localeOf(context), key, params);
}
