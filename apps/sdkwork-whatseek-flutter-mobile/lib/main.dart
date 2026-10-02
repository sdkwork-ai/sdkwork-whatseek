import 'package:flutter/material.dart';

import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart' hide WhatseekApp;

import 'app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // The standalone milestone boots the in-memory mock runtime directly;
  // Phase 2 binds generated SDK clients to the platform host adapters here.
  WhatseekRuntime.instance;
  runApp(const WhatseekApp());
}
