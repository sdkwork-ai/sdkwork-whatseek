import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";

/// Localized UI strings for the shell package (navigation chrome).
///
/// Source of truth: `lib/src/i18n/<locale>/whatseek/shell/strings.json`
/// (APP_FLUTTER_UI_SPEC §i18n layout). The maps below mirror those fragments;
/// `test/i18n_layout_test.dart` parses the fragments and fails on drift.
const Map<String, Map<String, String>> whatseekShellStrings = {
  'zh-CN': {
    'nav.brand': 'WhatSeek 问寻',
  },
  'en-US': {
    'nav.brand': 'WhatSeek',
  },
};

class WhatseekShellStrings {
  WhatseekShellStrings._();

  static const _set = WhatseekStringSet(whatseekShellStrings);

  /// Resolve a shell string for the ambient locale (zh fallback).
  static String of(
    BuildContext context,
    String key, [
    Map<String, Object?> params = const {},
  ]) =>
      _set.of(context, key, params);

  /// Resolve a shell string for an explicit locale (tests, shell-less use).
  static String resolve(
    String locale,
    String key, [
    Map<String, Object?> params = const {},
  ]) =>
      _set.resolve(locale, key, params);
}
