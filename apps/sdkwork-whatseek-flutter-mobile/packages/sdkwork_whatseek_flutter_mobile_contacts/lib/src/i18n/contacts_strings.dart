import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";

/// Localized UI strings for the contacts capability.
///
/// Source of truth: `lib/src/i18n/<locale>/whatseek/contacts/strings.json`
/// (APP_FLUTTER_UI_SPEC §i18n layout). The maps below mirror those fragments;
/// `test/i18n_layout_test.dart` parses the fragments and fails on drift.
const Map<String, Map<String, String>> whatseekContactsStrings = {
  'zh-CN': {
    'home.title': '通讯录',
    'detail.title': '联系人详情',
    'detail.notFound': '联系人不存在',
    'detail.company': '公司',
    'detail.sendMessage': '发消息',
  },
  'en-US': {
    'home.title': 'Contacts',
    'detail.title': 'Contact details',
    'detail.notFound': 'Contact not found',
    'detail.company': 'Company',
    'detail.sendMessage': 'Message',
  },
};

class WhatseekContactsStrings {
  WhatseekContactsStrings._();

  static const _set = WhatseekStringSet(whatseekContactsStrings);

  /// Resolve a contacts string for the ambient locale (zh fallback).
  static String of(
    BuildContext context,
    String key, [
    Map<String, Object?> params = const {},
  ]) =>
      _set.of(context, key, params);

  /// Resolve a contacts string for an explicit locale (tests, shell-less use).
  static String resolve(
    String locale,
    String key, [
    Map<String, Object?> params = const {},
  ]) =>
      _set.resolve(locale, key, params);
}
