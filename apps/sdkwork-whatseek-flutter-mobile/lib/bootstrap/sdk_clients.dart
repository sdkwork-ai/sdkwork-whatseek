/// SDK client family for the Flutter surface — Phase 1 returns the shared
/// mock clients from the core runtime; Phase 2 swaps this single factory for
/// generated app-SDK clients bound to the platform host adapters
/// (FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC.md §Platform adapters: widgets and
/// services depend on interfaces, never on plugin classes).
library;

import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';

class WhatseekSdkClients {
  const WhatseekSdkClients({
    required this.apps,
    required this.contacts,
    required this.messages,
    required this.tasks,
    required this.chat,
  });

  final MockAppsClient apps;
  final MockContactsClient contacts;
  final MockMessagesClient messages;
  final MockTasksClient tasks;
  final MockChatClient chat;

  /// Phase 1 mock family from the core runtime.
  factory WhatseekSdkClients.mock(WhatseekRuntime runtime) {
    return WhatseekSdkClients(
      apps: runtime.apps,
      contacts: runtime.contacts,
      messages: runtime.messages,
      tasks: runtime.tasks,
      chat: runtime.chat,
    );
  }
}
