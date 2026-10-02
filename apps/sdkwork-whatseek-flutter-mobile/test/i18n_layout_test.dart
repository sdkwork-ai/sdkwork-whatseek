// i18n layout + drift guard: every Flutter capability package must ship
// zh-CN/en-US fragments under `lib/src/i18n/<locale>/whatseek/<capability>/`
// (APP_FLUTTER_UI_SPEC §i18n layout) with identical key sets, and each
// package's Dart string map must mirror its fragments exactly.
import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_whatseek_flutter_mobile_apps/sdkwork_whatseek_flutter_mobile_apps.dart';
import 'package:sdkwork_whatseek_flutter_mobile_chat/sdkwork_whatseek_flutter_mobile_chat.dart';
import 'package:sdkwork_whatseek_flutter_mobile_commons/sdkwork_whatseek_flutter_mobile_commons.dart';
import 'package:sdkwork_whatseek_flutter_mobile_contacts/sdkwork_whatseek_flutter_mobile_contacts.dart';
import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';
import 'package:sdkwork_whatseek_flutter_mobile_messages/sdkwork_whatseek_flutter_mobile_messages.dart';
import 'package:sdkwork_whatseek_flutter_mobile_profile/sdkwork_whatseek_flutter_mobile_profile.dart';
import 'package:sdkwork_whatseek_flutter_mobile_shell/sdkwork_whatseek_flutter_mobile_shell.dart';

/// package-name suffix -> the Dart string map exposed by its loader.
const Map<String, Map<String, Map<String, String>>> dartStringMaps = {
  'core': whatseekCoreStrings,
  'commons': whatseekCommonsStrings,
  'shell': whatseekShellStrings,
  'chat': chatStrings,
  'apps': whatseekAppsStrings,
  'contacts': whatseekContactsStrings,
  'messages': whatseekMessagesStrings,
  'profile': whatseekProfileStrings,
};

/// Flattens a nested JSON fragment into dotted `section.key` -> value.
Map<String, String> flatten(dynamic value, [String prefix = '']) {
  if (value is Map<String, dynamic>) {
    final flattened = <String, String>{};
    value.forEach((key, child) {
      final path = prefix.isEmpty ? key : '$prefix.$key';
      flattened.addAll(flatten(child, path));
    });
    return flattened;
  }
  return {prefix: '$value'};
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
    for (final pkg in dartStringMaps.keys) {
      final zh = flatten(readFragment(pkg, 'zh-CN'));
      final en = flatten(readFragment(pkg, 'en-US'));
      expect(en.keys.toSet(), equals(zh.keys.toSet()),
          reason: 'locale key drift in $pkg');
    }
  });

  test('every_dart_string_map_mirrors_its_fragments_exactly', () {
    for (final entry in dartStringMaps.entries) {
      for (final locale in const ['zh-CN', 'en-US']) {
        final fragment = flatten(readFragment(entry.key, locale));
        final dartMap = entry.value[locale];
        expect(dartMap, isNotNull, reason: 'missing Dart map: ${entry.key}/$locale');
        expect(dartMap, equals(fragment),
            reason: 'Dart map drift in ${entry.key}/$locale');
      }
    }
  });

  test('loaders_resolve_with_zh_fallback_and_interpolation', () {
    expect(WhatseekChatStrings.resolve('zh-CN', 'home.heroTitle'), equals('你想做什么？'));
    expect(WhatseekChatStrings.resolve('en-US', 'home.heroTitle'),
        equals('What do you want to do?'));
    // Unknown keys fall back to zh-CN, then to the key itself.
    expect(WhatseekChatStrings.resolve('en-US', 'home.thinking'),
        equals('WhatSeek is thinking…'));
    expect(WhatseekAppsStrings.resolve('zh-CN', 'search.resultCount', {'count': 3}),
        equals('找到 3 个应用'));
    expect(WhatseekAppsStrings.resolve('en-US', 'search.resultCount', {'count': 3}),
        equals('3 apps found'));
    // Raw service text passes through unresolved (H5 defaultValue semantics).
    expect(WhatseekChatStrings.resolve('zh-CN', '下午三点开会记得参加。'),
        equals('下午三点开会记得参加。'));
  });
}
