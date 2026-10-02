import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";

/// Localized UI strings for the commons package (shared leaf widgets).
///
/// Source of truth: `lib/src/i18n/<locale>/whatseek/commons/strings.json`
/// (APP_FLUTTER_UI_SPEC §i18n layout). The maps below mirror those fragments;
/// `test/i18n_layout_test.dart` parses the fragments and fails on drift.
const Map<String, Map<String, String>> whatseekCommonsStrings = {
  'zh-CN': {
    'action.back': '返回',
    'state.loading.title': '加载中…',
    'state.loading.description': '正在为你获取内容',
    'state.empty.title': '这里还空空如也',
    'state.empty.description': '换个方式试试，或者直接告诉问寻你想做什么',
    'state.error.title': '出错了',
    'state.error.description': '内容没有加载成功，请重试',
    'state.permissionDenied.title': '没有权限',
    'state.permissionDenied.description': '当前账号无权访问该内容',
    'state.retry': '重试',
  },
  'en-US': {
    'action.back': 'Back',
    'state.loading.title': 'Loading…',
    'state.loading.description': 'Fetching content for you',
    'state.empty.title': 'Nothing here yet',
    'state.empty.description': 'Try another way, or just tell WhatSeek what you need',
    'state.error.title': 'Something went wrong',
    'state.error.description': 'The content failed to load. Please retry.',
    'state.permissionDenied.title': 'Permission denied',
    'state.permissionDenied.description': 'This account cannot access the content',
    'state.retry': 'Retry',
  },
};

class WhatseekCommonsStrings {
  WhatseekCommonsStrings._();

  static const _set = WhatseekStringSet(whatseekCommonsStrings);

  /// Resolve a commons string for the ambient locale (zh fallback).
  static String of(
    BuildContext context,
    String key, [
    Map<String, Object?> params = const {},
  ]) =>
      _set.of(context, key, params);

  /// Resolve a commons string for an explicit locale (tests, shell-less use).
  static String resolve(
    String locale,
    String key, [
    Map<String, Object?> params = const {},
  ]) =>
      _set.resolve(locale, key, params);
}
