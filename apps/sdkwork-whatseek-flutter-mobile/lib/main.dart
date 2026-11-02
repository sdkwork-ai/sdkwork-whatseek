import 'package:flutter/material.dart';

import 'app.dart';
import 'bootstrap/runtime.dart';
import 'bootstrap/sdkwork_tls_trust.dart';

Future<void> main() async {
  // The HTTPS trust layer must be installed before any HTTP client is
  // created, so it runs ahead of binding initialization and services.
  SdkworkTlsTrust.installForApp();

  WidgetsFlutterBinding.ensureInitialized();
  // One-time bootstrap: dart-define environment identity, platform host
  // adapters, IAM visitor session, and the mock SDK client family.
  // Phase 2 swaps the client family for generated SDK clients here.
  WhatseekBootstrap.bootstrap();
  runApp(const WhatseekApp());
}
