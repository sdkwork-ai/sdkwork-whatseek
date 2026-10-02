/// Localized UI strings for the chat capability.
///
/// Source of truth: `lib/src/i18n/<locale>/whatseek/chat/strings.json`
/// (APP_FLUTTER_UI_SPEC §i18n layout). The maps below mirror those fragments;
/// `test/i18n_layout_test.dart` parses the fragments and fails on drift.
library;

const Map<String, Map<String, String>> chatHomeStrings = {
  'zh-CN': {
    'heroTitle': '你想做什么？',
    'heroSubtitle': '告诉我就可以。',
    'composerHint': '输入消息……',
    'thinking': '问寻正在思考…',
    'newTopic': '开始新对话',
  },
  'en-US': {
    'heroTitle': 'What do you want to do?',
    'heroSubtitle': 'Just tell me.',
    'composerHint': 'Type a message…',
    'thinking': 'WhatSeek is thinking…',
    'newTopic': 'Start a new chat',
  },
};

class WhatseekChatStrings {
  WhatseekChatStrings._();

  static String locale = 'zh-CN';

  /// Resolve a home-screen string for the active locale (zh fallback).
  static String home(String key) {
    final localeMap = chatHomeStrings[locale] ?? chatHomeStrings['zh-CN']!;
    return localeMap[key] ?? chatHomeStrings['zh-CN']![key] ?? key;
  }
}
