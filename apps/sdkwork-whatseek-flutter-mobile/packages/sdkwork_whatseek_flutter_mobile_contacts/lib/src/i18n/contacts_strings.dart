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
    'home.searchPlaceholder': '搜索联系人、群组、企业或 Agent',
    'home.listTitle': '全部联系人（{{count}}）',
    'home.emptyTitle': '没有找到匹配的联系人',
    'home.segment.all': '全部',
    'home.segment.person': '联系人',
    'home.segment.group': '群组',
    'home.segment.org': '企业与商家',
    'home.segment.agent': 'Agent',
    'home.segment.assistant': 'AI 助手',
    'detail.title': '联系人详情',
    'detail.notFound': '联系人不存在',
    'detail.company': '公司',
    'detail.sendMessage': '发消息',
  },
  'en-US': {
    'home.title': 'Contacts',
    'home.searchPlaceholder': 'Search people, groups, organizations, or agents',
    'home.listTitle': 'All contacts ({{count}})',
    'home.emptyTitle': 'No matching contacts',
    'home.segment.all': 'All',
    'home.segment.person': 'People',
    'home.segment.group': 'Groups',
    'home.segment.org': 'Orgs & merchants',
    'home.segment.agent': 'Agents',
    'home.segment.assistant': 'AI assistants',
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
