/// SDK client family for the Flutter surface (APP_SDK_INTEGRATION_SPEC.md §1
/// + §3: the bootstrap composition root is the only place that constructs SDK
/// clients; Flutter consumes the generated Dart SDK family `im_sdk_composed`
/// — never TypeScript wrappers or React packages).
///
/// The sdkwork-im driver (messages + contacts capabilities) activates when the
/// runtime environment declares an IM API base URL (`sdkworkImApiBaseUrl` from
/// `env/sdkwork.<profileId>.json` dart-define sources): one composed
/// `ImSdkComposedClient` is constructed with the shared session credentials
/// and injected into both port adapters, which then replace the mock
/// registrations on the runtime. Empty (standalone milestone default) keeps
/// every port on the Phase-1 mock clients. All other ports stay on mock
/// clients until their SDK families land.
library;

import 'package:im_sdk_composed/im_sdk_composed.dart';
import 'package:sdkwork_whatseek_flutter_mobile_contacts/sdkwork_whatseek_flutter_mobile_contacts.dart';
import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';
import 'package:sdkwork_whatseek_flutter_mobile_messages/sdkwork_whatseek_flutter_mobile_messages.dart';

import 'iam_runtime.dart';
import 'environment.dart';

/// The composed IM client bound to the resolved environment, plus the two port
/// adapters it feeds. `client == null` selects the mock driver.
class WhatseekImClients {
  const WhatseekImClients._({
    required this.client,
    required this.contacts,
    required this.messages,
  });

  final ImSdkComposedClient? client;
  final ContactsClient contacts;
  final MessagesClient messages;

  /// Construct the composed IM family for the environment, or `null` when no
  /// IM gateway is declared (mock-driver standalone milestone).
  static WhatseekImClients? bind(WhatseekRuntimeEnvironment env) {
    final apiBaseUrl = env.sdkworkImApiBaseUrl?.trim() ?? '';
    if (apiBaseUrl.isEmpty) {
      return null;
    }
    // Credential note (APP_SDK_INTEGRATION_SPEC.md §3 open-api rule): the
    // dual-token branch shares the application login TokenManager. The Dart
    // generated family takes static credentials on `SdkConfig` today; the
    // Phase-2 IAM runtime feeds the session tokens here. The standalone
    // milestone starts credential-less, so the driver only activates when a
    // gateway is actually mounted.
    final websocketBaseUrl = env.sdkworkImWebSocketBaseUrl?.trim() ?? '';
    final transport = SdkworkImClient(
      config: SdkConfig(baseUrl: apiBaseUrl, timeout: 15000),
    );
    final client = ImSdkComposedClient(
      transport: transport,
      websocketBaseUrl:
          websocketBaseUrl.isEmpty ? apiBaseUrl.replaceFirst(RegExp('^http'), 'ws') : websocketBaseUrl,
    );
    return WhatseekImClients._(
      client: client,
      contacts: ImContactsClient(
        options: ImContactsClientOptions(
          gateway: ImSocialApiGateway(transport.social),
        ),
      ),
      messages: ImMessagesClient(
        options: ImMessagesClientOptions(
          gateway: ImChatApiGateway(transport.chat),
          currentUserId: () => WhatseekIamRuntime.instance.ensureSession().id,
        ),
      ),
    );
  }
}

class WhatseekSdkClients {
  const WhatseekSdkClients({
    required this.apps,
    required this.contacts,
    required this.messages,
    required this.tasks,
    required this.chat,
  });

  final MockAppsClient apps;
  final ContactsClient contacts;
  final MessagesClient messages;
  final MockTasksClient tasks;
  final MockChatClient chat;

  /// Resolve the client family for the runtime environment: IM-backed
  /// contacts/messages ports when a gateway is declared, mock clients
  /// otherwise. The ports are also bound onto the runtime so screens and the
  /// chat capability compose over the effective drivers.
  factory WhatseekSdkClients.resolve(WhatseekRuntimeEnvironment env) {
    final runtime = WhatseekRuntime.instance;
    final im = WhatseekImClients.bind(env);
    if (im != null) {
      runtime.bindPorts(contacts: im.contacts, messages: im.messages);
    }
    return WhatseekSdkClients(
      apps: runtime.apps,
      contacts: runtime.contacts,
      messages: runtime.messages,
      tasks: runtime.tasks,
      chat: runtime.chat,
    );
  }

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
