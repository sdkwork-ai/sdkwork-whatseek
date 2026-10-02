import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";

/// Localized UI strings for the messages capability.
///
/// Source of truth: `lib/src/i18n/<locale>/whatseek/messages/strings.json`
/// (APP_FLUTTER_UI_SPEC §i18n layout). The maps below mirror those fragments;
/// `test/i18n_layout_test.dart` parses the fragments and fails on drift.
const Map<String, Map<String, String>> whatseekMessagesStrings = {
  'zh-CN': {
    'kind.system': '通知',
    'kind.app': '应用通知',
    'kind.task': 'AI 任务',
    'home.title': '消息',
    'home.subtitle': '私聊、通知与 AI 任务事件都在这里',
    'conversation.title': '会话',
    'conversation.emptyTitle': '还没有消息',
    'conversation.inputPlaceholder': '输入消息……',
    'conversation.send': '发送',
  },
  'en-US': {
    'kind.system': 'Notifications',
    'kind.app': 'App notice',
    'kind.task': 'AI task',
    'home.title': 'Messages',
    'home.subtitle': 'Chats, notifications, and AI task events in one place',
    'conversation.title': 'Conversation',
    'conversation.emptyTitle': 'No messages yet',
    'conversation.inputPlaceholder': 'Type a message…',
    'conversation.send': 'Send',
  },
};

class WhatseekMessagesStrings {
  WhatseekMessagesStrings._();

  static const _set = WhatseekStringSet(whatseekMessagesStrings);

  /// Resolve a messages string for the ambient locale (zh fallback).
  static String of(
    BuildContext context,
    String key, [
    Map<String, Object?> params = const {},
  ]) =>
      _set.of(context, key, params);

  /// Resolve a messages string for an explicit locale (tests, shell-less use).
  static String resolve(
    String locale,
    String key, [
    Map<String, Object?> params = const {},
  ]) =>
      _set.resolve(locale, key, params);
}
