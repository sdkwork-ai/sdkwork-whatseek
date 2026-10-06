/// Runtime for the WhatSeek Flutter surface: one client family per session.
/// The contacts/messages accessors are the port interfaces — the Phase-1 mock
/// clients by default, swapped by `bindPorts` for the sdkwork-im adapters when
/// the runtime config mounts an IM gateway (bootstrap composition root only;
/// APP_SDK_INTEGRATION_SPEC.md §1). Chat stays on the mock family until its
/// SDK family lands and is recomposed over the effective ports on rebind.
library;

import 'package:flutter/foundation.dart';

import 'mock/apps_client.dart';
import 'mock/clients.dart';
import 'ports.dart';

class WhatseekRuntime {
  WhatseekRuntime();

  final MockAppsClient apps = MockAppsClient();

  ContactsClient contacts = MockContactsClient();
  MessagesClient messages = MockMessagesClient();

  final MockTasksClient tasks = MockTasksClient();
  late MockChatClient chat = _composeChat();

  MockChatClient _composeChat() => MockChatClient(
        apps: apps,
        contacts: contacts,
        messages: messages,
        tasks: tasks,
      );

  /// Swap the contacts/messages drivers and recompose the chat capability
  /// over the effective ports. Called by the bootstrap composition root only.
  void bindPorts({required ContactsClient contacts, required MessagesClient messages}) {
    this.contacts = contacts;
    this.messages = messages;
    chat = _composeChat();
  }

  /// PRD §5.5 deep link: task notifications park the task id here; the chat
  /// screen consumes it (entry + state chip) and clears the link.
  final ValueNotifier<String?> pendingTaskLink = ValueNotifier<String?>(null);

  /// Tab switch requests from pushed routes (0 = chat tab); the app scaffold
  /// consumes and clears the request.
  final ValueNotifier<int?> tabRequest = ValueNotifier<int?>(null);

  static final WhatseekRuntime instance = WhatseekRuntime();
}
