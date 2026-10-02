/// Runtime bootstrap for the Flutter surface: environment identity, host
/// adapters, IAM session, and the SDK client family, assembled once.
library;

import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';

import 'environment.dart';
import 'host_adapters.dart';
import 'iam_runtime.dart';
import 'sdk_clients.dart';

class WhatseekBootstrap {
  const WhatseekBootstrap({
    required this.environment,
    required this.clients,
    required this.iam,
  });

  final WhatseekRuntimeEnvironment environment;
  final WhatseekSdkClients clients;
  final WhatseekIamRuntime iam;

  static WhatseekBootstrap? _instance;

  /// One-time bootstrap used by `main()`; idempotent for tests.
  static WhatseekBootstrap bootstrap() {
    if (_instance != null) {
      return _instance!;
    }
    WhatseekRuntime.instance; // initializes the mock client family
    HostAdapters(); // binds the default platform adapters
    final iam = WhatseekIamRuntime.instance..ensureSession();
    _instance = WhatseekBootstrap(
      environment: WhatseekRuntimeEnvironment.fromDefines(),
      clients: WhatseekSdkClients.mock(WhatseekRuntime.instance),
      iam: iam,
    );
    return _instance!;
  }
}
