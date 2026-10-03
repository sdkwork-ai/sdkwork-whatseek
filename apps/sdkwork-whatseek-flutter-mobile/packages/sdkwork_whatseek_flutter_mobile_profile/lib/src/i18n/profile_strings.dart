import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";

/// Localized UI strings for the profile capability.
///
/// Source of truth: `lib/src/i18n/<locale>/whatseek/profile/strings.json`
/// (APP_FLUTTER_UI_SPEC §i18n layout). The maps below mirror those fragments;
/// `test/i18n_layout_test.dart` parses the fragments and fails on drift.
const Map<String, Map<String, String>> whatseekProfileStrings = {
  'zh-CN': {
    'home.title': '我的',
    'home.visitor': '访客',
    'home.visitorHint': '登录后同步你的数字资产',
    'home.signedIn': '已登录',
    'home.signIn': '登录',
    'home.signOut': '退出登录',
    'home.asset.chats': '对话',
    'home.asset.apps': '应用',
    'home.asset.contacts': '联系人',
    'home.asset.agents': 'Agent',
    'home.myApps': '我的应用',
    'home.favorites': '收藏',
    'home.settings': '设置',
    'home.brand': '你负责问，AI 负责寻',
    'settings.title': '设置',
    'settings.darkMode': '外观',
    'settings.darkModeHint': '切换浅色 / 深色主题',
    'settings.mode.system': '跟随系统',
    'settings.mode.light': '浅色',
    'settings.mode.dark': '深色',
    'settings.language': '语言',
    'settings.locale.zhCN': '简体中文',
    'settings.locale.enUS': 'English',
    'settings.about': '关于',
    'settings.version': '版本',
    'settings.routeContracts': '路由契约数',
    'settings.brandTitle': 'WhatSeek 问寻',
    'settings.brandMessage': '你负责问，AI 负责寻。',
  },
  'en-US': {
    'home.title': 'Me',
    'home.visitor': 'Visitor',
    'home.visitorHint': 'Sign in to sync your digital assets',
    'home.signedIn': 'Signed in',
    'home.signIn': 'Sign in',
    'home.signOut': 'Sign out',
    'home.asset.chats': 'Chats',
    'home.asset.apps': 'Apps',
    'home.asset.contacts': 'Contacts',
    'home.asset.agents': 'Agents',
    'home.myApps': 'My apps',
    'home.favorites': 'Favorites',
    'home.settings': 'Settings',
    'home.brand': 'You ask, AI seeks',
    'settings.title': 'Settings',
    'settings.darkMode': 'Appearance',
    'settings.darkModeHint': 'Switch light / dark theme',
    'settings.mode.system': 'System',
    'settings.mode.light': 'Light',
    'settings.mode.dark': 'Dark',
    'settings.language': 'Language',
    'settings.locale.zhCN': '简体中文',
    'settings.locale.enUS': 'English',
    'settings.about': 'About',
    'settings.version': 'Version',
    'settings.routeContracts': 'Route contracts',
    'settings.brandTitle': 'WhatSeek',
    'settings.brandMessage': 'You ask, AI seeks.',
  },
};

class WhatseekProfileStrings {
  WhatseekProfileStrings._();

  static const _set = WhatseekStringSet(whatseekProfileStrings);

  /// Resolve a profile string for the ambient locale (zh fallback).
  static String of(
    BuildContext context,
    String key, [
    Map<String, Object?> params = const {},
  ]) =>
      _set.of(context, key, params);

  /// Resolve a profile string for an explicit locale (tests, shell-less use).
  static String resolve(
    String locale,
    String key, [
    Map<String, Object?> params = const {},
  ]) =>
      _set.resolve(locale, key, params);
}
