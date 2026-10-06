/// Runtime bootstrap for the Flutter surface: environment identity, host
/// adapters, IAM session, settings, and the SDK client family, assembled once.
library;

import 'dart:async';

import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';

import 'environment.dart';
import 'host_adapters.dart';
import 'iam_runtime.dart';
import 'sdk_clients.dart';
import 'settings.dart';

class WhatseekBootstrap {
  const WhatseekBootstrap({
    required this.environment,
    required this.clients,
    required this.iam,
    required this.settings,
  });

  final WhatseekRuntimeEnvironment environment;
  final WhatseekSdkClients clients;
  final WhatseekIamRuntime iam;
  final WhatseekAppSettings settings;

  static WhatseekBootstrap? _instance;

  /// One-time bootstrap used by `main()`; idempotent for tests.
  static WhatseekBootstrap bootstrap() {
    if (_instance != null) {
      return _instance!;
    }
    WhatseekRuntime.instance; // initializes the mock client family
    HostAdapters(); // binds the default platform adapters
    final iam = WhatseekIamRuntime.instance..ensureSession();
    final settings = WhatseekAppSettings.instance;
    unawaited(settings.restore()); // persisted preferences apply when ready
    final environment = WhatseekRuntimeEnvironment.fromDefines();
    _instance = WhatseekBootstrap(
      environment: environment,
      // resolve() mounts the sdkwork-im drivers when the environment declares
      // an IM gateway and binds them onto the runtime; otherwise every port
      // stays on the Phase-1 mock clients.
      clients: WhatseekSdkClients.resolve(environment),
      iam: iam,
      settings: settings,
    );
    return _instance!;
  }
}
