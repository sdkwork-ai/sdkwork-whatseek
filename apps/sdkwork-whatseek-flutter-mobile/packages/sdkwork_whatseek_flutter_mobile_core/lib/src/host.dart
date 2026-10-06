/// Typed host ports the capability packages consume directly
/// (FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC.md §Platform adapters: widgets
/// depend on interfaces, never on plugin classes). The app shell may swap the
/// implementations at bootstrap; the defaults bind the framework services.
library;

import 'package:flutter/services.dart';

abstract interface class ClipboardPort {
  Future<void> copy(String text);
}

class SystemClipboardPort implements ClipboardPort {
  const SystemClipboardPort();

  @override
  Future<void> copy(String text) async {
    await Clipboard.setData(ClipboardData(text: text));
  }
}

/// Static service locator for the host ports screens consume (PRD §21
/// 我的应用 share). Tests may override with a recording fake.
class WhatseekHost {
  WhatseekHost._();

  static ClipboardPort clipboard = const SystemClipboardPort();
}
