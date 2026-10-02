import 'package:flutter/material.dart';

import 'whatseek_i18n.dart';

/// Localized UI strings for the core package (shell tab vocabulary).
///
/// Source of truth: `lib/src/i18n/<locale>/whatseek/core/strings.json`
/// (APP_FLUTTER_UI_SPEC §i18n layout). The maps below mirror those fragments;
/// `test/i18n_layout_test.dart` parses the fragments and fails on drift.
const Map<String, Map<String, String>> whatseekCoreStrings = {
  'zh-CN': {
    'shell.tab.chat': '对话',
    'shell.tab.apps': '应用',
    'shell.tab.contacts': '通讯录',
    'shell.tab.messages': '消息',
    'shell.tab.profile': '我的',
  },
  'en-US': {
    'shell.tab.chat': 'Chat',
    'shell.tab.apps': 'Apps',
    'shell.tab.contacts': 'Contacts',
    'shell.tab.messages': 'Messages',
    'shell.tab.profile': 'Me',
  },
};

class WhatseekCoreStrings {
  WhatseekCoreStrings._();

  static const _set = WhatseekStringSet(whatseekCoreStrings);

  /// Resolve a core string for the ambient locale (zh fallback).
  static String of(
    BuildContext context,
    String key, [
    Map<String, Object?> params = const {},
  ]) =>
      _set.of(context, key, params);

  /// Resolve a core string for an explicit locale (tests, shell-less use).
  static String resolve(
    String locale,
    String key, [
    Map<String, Object?> params = const {},
  ]) =>
      _set.resolve(locale, key, params);
}
