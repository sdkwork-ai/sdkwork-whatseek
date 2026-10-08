/// SDK client family for the Flutter surface (APP_SDK_INTEGRATION_SPEC.md §1
/// + §3: the bootstrap composition root is the only place that constructs SDK
/// clients; Flutter consumes the generated Dart SDK families `im_sdk_composed`
/// and `sdkwork_appstore_app_sdk` — never TypeScript wrappers or React
/// packages).
///
/// The sdkwork-im driver (messages + contacts capabilities) activates when the
/// runtime environment declares an IM API base URL (`sdkworkImApiBaseUrl` from
/// `env/sdkwork.<profileId>.json` dart-define sources): one composed
/// `ImSdkComposedClient` is constructed with the shared session credentials
/// and injected into both port adapters, which then replace the mock
/// registrations on the runtime. The sdkwork-appstore driver (apps capability)
/// follows the same activation rule over `sdkworkAppstoreApiBaseUrl`. Empty
/// (standalone milestone default) keeps every port on the Phase-1 mock
/// clients. Remaining ports stay on mock clients until their SDK families
/// land.
library;

import 'package:im_sdk_composed/im_sdk_composed.dart';
// Aliased: `SdkConfig` exists in both generated families (im + appstore);
// the appstore side is namespaced to keep the IM construction unqualified.
import 'package:sdkwork_appstore_app_sdk/sdkwork_appstore_app_sdk.dart' as appstore;
import 'package:sdkwork_whatseek_flutter_mobile_apps/sdkwork_whatseek_flutter_mobile_apps.dart';
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
    // Phase-2 IAM runtime feeds the session tokens here, while the
    // operator-declared `SDKWORK_IM_BOOTSTRAP_*` dart-define bridge (minted by
    // the gateway's own IAM credential-entry surface) carries them until it
    // lands. Null keeps the client credential-less — the gateway rejects
    // unauthenticated calls, so the driver only activates when a gateway is
    // actually mounted.
    final websocketBaseUrl = env.sdkworkImWebSocketBaseUrl?.trim() ?? '';
    final bootstrapAccessToken = env.sdkworkImBootstrapAccessToken?.trim() ?? '';
    final bootstrapAuthToken = env.sdkworkImBootstrapAuthToken?.trim() ?? '';
    final transport = SdkworkImClient(
      config: SdkConfig(
        baseUrl: apiBaseUrl,
        timeout: 15000,
        accessToken: bootstrapAccessToken.isEmpty ? null : bootstrapAccessToken,
        authToken: bootstrapAuthToken.isEmpty ? null : bootstrapAuthToken,
      ),
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

  final AppsClient apps;
  final ContactsClient contacts;
  final MessagesClient messages;
  final MockTasksClient tasks;
  final MockChatClient chat;

  /// Resolve the client family for the runtime environment: IM-backed
  /// contacts/messages ports when a gateway is declared, the appstore-backed
  /// apps port when the appstore gateway is declared, mock clients otherwise.
  /// The ports are also bound onto the runtime so screens and the chat
  /// capability compose over the effective drivers.
  factory WhatseekSdkClients.resolve(WhatseekRuntimeEnvironment env) {
    final runtime = WhatseekRuntime.instance;
    final im = WhatseekImClients.bind(env);
    final appstore = WhatseekAppstoreClients.bind(env);
    if (im != null || appstore != null) {
      runtime.bindPorts(
        contacts: im?.contacts,
        messages: im?.messages,
        apps: appstore?.apps,
      );
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

/// The composed appstore client bound to the resolved environment, plus the
/// apps port adapter it feeds. `null` selects the mock apps driver.
class WhatseekAppstoreClients {
  const WhatseekAppstoreClients._({required this.client, required this.apps});

  final appstore.SdkworkAppstoreAppClient client;
  final AppsClient apps;

  /// Construct the composed appstore family for the environment, or `null`
  /// when no appstore gateway is declared (mock-driver standalone milestone).
  /// Credential note: static dual-token credentials on `SdkConfig` today, fed
  /// by the operator-declared `SDKWORK_APPSTORE_BOOTSTRAP_*` dart-define
  /// bridge until the Phase-2 IAM login runtime lands; null/empty keeps the
  /// client credential-less — the appstore app-api rejects unauthenticated
  /// calls, so the driver only activates when a gateway is actually mounted.
  static WhatseekAppstoreClients? bind(WhatseekRuntimeEnvironment env) {
    final apiBaseUrl = env.sdkworkAppstoreApiBaseUrl?.trim() ?? '';
    if (apiBaseUrl.isEmpty) {
      return null;
    }
    final bootstrapAccessToken = env.sdkworkAppstoreBootstrapAccessToken?.trim() ?? '';
    final bootstrapAuthToken = env.sdkworkAppstoreBootstrapAuthToken?.trim() ?? '';
    final transport = appstore.SdkworkAppstoreAppClient(
      config: appstore.SdkConfig(
        baseUrl: apiBaseUrl,
        timeout: 15000,
        accessToken: bootstrapAccessToken.isEmpty ? null : bootstrapAccessToken,
        authToken: bootstrapAuthToken.isEmpty ? null : bootstrapAuthToken,
      ),
    );
    return WhatseekAppstoreClients._(
      client: transport,
      apps: AppstoreAppsClient(
        gateway: SdkworkAppstoreCatalogGateway(transport),
      ),
    );
  }
}
