import 'package:flutter/material.dart';

import 'app.dart';
import 'bootstrap/runtime.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // One-time bootstrap: dart-define environment identity, platform host
  // adapters, IAM visitor session, and the mock SDK client family.
  // Phase 2 swaps the client family for generated SDK clients here.
  WhatseekBootstrap.bootstrap();
  runApp(const WhatseekApp());
}
