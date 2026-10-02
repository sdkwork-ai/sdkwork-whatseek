// One-shot fixer for the flutter analyze issues (run from the flutter-mobile dir).
import { readFileSync, writeFileSync } from 'node:fs';

const CORE_URI = 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';

// runtime.dart — public unnamed constructor + singleton via public ctor.
writeFileSync(
  'packages/sdkwork_whatseek_flutter_mobile_core/lib/src/runtime.dart',
  [
    '/// Runtime for the WhatSeek Flutter surface: one mock client family per',
    '/// session (Phase 1) — Phase 2 swaps these for generated SDK clients behind',
    '/// the same accessors.',
    'library;',
    '',
    "import 'mock/apps_client.dart';",
    "import 'mock/clients.dart';",
    '',
    'class WhatseekRuntime {',
    '  WhatseekRuntime();',
    '',
    '  final MockAppsClient apps = MockAppsClient();',
    '  final MockContactsClient contacts = MockContactsClient();',
    '  final MockMessagesClient messages = MockMessagesClient();',
    '  final MockTasksClient tasks = MockTasksClient();',
    '  late final MockChatClient chat = MockChatClient(',
    '    apps: apps,',
    '    contacts: contacts,',
    '    messages: messages,',
    '    tasks: tasks,',
    '  );',
    '',
    '  static final WhatseekRuntime instance = WhatseekRuntime();',
    '}',
    '',
  ].join('\n'),
);

// apps_client.dart — no nullable collection elements.
{
  let t = readFileSync('packages/sdkwork_whatseek_flutter_mobile_core/lib/src/mock/apps_client.dart', 'utf8');
  t = t.replace(
    /  Future<List<WhatseekApp>> listRecent\(\) async => \[[\s\S]*?\];/u,
    [
      '  Future<List<WhatseekApp>> listRecent() async {',
      '    final results = <WhatseekApp>[];',
      '    for (final id in _recentIds.take(8)) {',
      '      final app = await getApp(id);',
      '      if (app != null) {',
      '        results.add(app);',
      '      }',
      '    }',
      '    return results;',
      '  }',
    ].join('\n'),
  );
  t = t.replace(
    /  Future<List<WhatseekApp>> listFavorites\(\) async => \[[\s\S]*?\];/u,
    [
      '  Future<List<WhatseekApp>> listFavorites() async {',
      '    final results = <WhatseekApp>[];',
      '    for (final id in _favoriteIds) {',
      '      final app = await getApp(id);',
      '      if (app != null) {',
      '        results.add(app);',
      '      }',
      '    }',
      '    return results;',
      '  }',
    ].join('\n'),
  );
  writeFileSync('packages/sdkwork_whatseek_flutter_mobile_core/lib/src/mock/apps_client.dart', t);
}

// clients.dart — imperative unreadTotal.
{
  let t = readFileSync('packages/sdkwork_whatseek_flutter_mobile_core/lib/src/mock/clients.dart', 'utf8');
  t = t.replace(
    /  Future<int> unreadTotal\(\) async =>[\s\S]*?;/u,
    [
      '  Future<int> unreadTotal() async {',
      '    var total = 0;',
      '    for (final conversation in _conversations) {',
      '      total += conversation.unread;',
      '    }',
      '    return total;',
      '  }',
    ].join('\n'),
  );
  writeFileSync('packages/sdkwork_whatseek_flutter_mobile_core/lib/src/mock/clients.dart', t);
}

// chat_screen.dart — ChatEntry is not const-constructible.
{
  let t = readFileSync('packages/sdkwork_whatseek_flutter_mobile_chat/lib/src/chat_screen.dart', 'utf8');
  t = t.split("const ChatEntry(role: 'assistant', text: '出了点问题，请重试。')")
    .join("ChatEntry(role: 'assistant', text: '出了点问题，请重试。')");
  writeFileSync('packages/sdkwork_whatseek_flutter_mobile_chat/lib/src/chat_screen.dart', t);
}

// main.dart — hide the model WhatseekApp (ambiguity with the root widget).
{
  let t = readFileSync('lib/main.dart', 'utf8');
  if (!t.includes(' hide WhatseekApp')) {
    t = t.replace(
      `import '${CORE_URI}';`,
      `import '${CORE_URI}' hide WhatseekApp;`,
    );
  }
  writeFileSync('lib/main.dart', t);
}

// profile_home_screen.dart — records without the broken IIFE.
{
  let t = readFileSync('packages/sdkwork_whatseek_flutter_mobile_profile/lib/src/profile_home_screen.dart', 'utf8');
  t = t.replace(
    /    _assets = \(\) async => \([\s\S]*?\)\(\);/u,
    [
      '    final conversations = await runtime.messages.listConversations();',
      '    final myApps = await runtime.apps.listMyApps();',
      '    final contacts = await runtime.contacts.listContacts();',
      '    _assets = Future.value((conversations.length, myApps.length, contacts.length));',
    ].join('\n'),
  );
  writeFileSync('packages/sdkwork_whatseek_flutter_mobile_profile/lib/src/profile_home_screen.dart', t);
}

// shell test — renamed parameter.
{
  let t = readFileSync('test/app_shell_test.dart', 'utf8');
  t = t.split('current_index: 0').join('currentIndex: 0');
  writeFileSync('test/app_shell_test.dart', t);
}

console.log('flutter fixes applied');
