// i18n layout + drift guard: every Flutter capability package must ship
// zh-CN/en-US fragments (APP_FLUTTER_UI_SPEC §i18n layout) with identical key
// sets, and the Dart string maps must match the chat fragments exactly.
import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_whatseek_flutter_mobile_chat/sdkwork_whatseek_flutter_mobile_chat.dart';

const packages = [
  'core',
  'commons',
  'shell',
  'chat',
  'apps',
  'contacts',
  'messages',
  'profile',
];

Set<String> keyPaths(dynamic value, [String prefix = '']) {
  if (value is! Map<String, dynamic>) {
    return {prefix};
  }
  final keys = <String>{};
  value.forEach((key, child) {
    final path = prefix.isEmpty ? key : '$prefix.$key';
    keys.addAll(keyPaths(child, path));
  });
  return keys;
}

Map<String, dynamic> readFragment(String pkg, String locale) {
  final file = File(
    'packages/sdkwork_whatseek_flutter_mobile_$pkg/lib/src/i18n/$locale/whatseek/$pkg/strings.json',
  );
  expect(file.existsSync(), isTrue, reason: 'missing fragment: $pkg/$locale');
  return jsonDecode(file.readAsStringSync()) as Map<String, dynamic>;
}

void main() {
  test('every_package_ships_zh_and_en_fragments_with_key_parity', () {
    for (final pkg in packages) {
      final zh = keyPaths(readFragment(pkg, 'zh-CN'));
      final en = keyPaths(readFragment(pkg, 'en-US'));
      expect(en, equals(zh), reason: 'locale key drift in $pkg');
    }
  });

  test('chat_home_maps_match_the_chat_fragments_exactly', () {
    final zhHome = readFragment('chat', 'zh-CN')['home'] as Map<String, dynamic>;
    final enHome = readFragment('chat', 'en-US')['home'] as Map<String, dynamic>;
    expect(chatHomeStrings['zh-CN'], equals(zhHome), reason: 'zh map drift');
    expect(chatHomeStrings['en-US'], equals(enHome), reason: 'en map drift');
  });

  test('home_loader_resolves_keys_with_zh_fallback', () {
    WhatseekChatStrings.locale = 'zh-CN';
    expect(WhatseekChatStrings.home('heroTitle'), equals('你想做什么？'));
    WhatseekChatStrings.locale = 'en-US';
    expect(WhatseekChatStrings.home('heroTitle'), equals('What do you want to do?'));
    WhatseekChatStrings.locale = 'zh-CN';
  });
}
