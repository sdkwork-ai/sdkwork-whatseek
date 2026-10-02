/// Runtime for the WhatSeek Flutter surface: one mock client family per
/// session (Phase 1) — Phase 2 swaps these for generated SDK clients behind
/// the same accessors.
library;

import 'mock/apps_client.dart';
import 'mock/clients.dart';

class WhatseekRuntime {
  WhatseekRuntime();

  final MockAppsClient apps = MockAppsClient();
  final MockContactsClient contacts = MockContactsClient();
  final MockMessagesClient messages = MockMessagesClient();
  final MockTasksClient tasks = MockTasksClient();
  late final MockChatClient chat = MockChatClient(
    apps: apps,
    contacts: contacts,
    messages: messages,
    tasks: tasks,
  );

  static final WhatseekRuntime instance = WhatseekRuntime();
}
