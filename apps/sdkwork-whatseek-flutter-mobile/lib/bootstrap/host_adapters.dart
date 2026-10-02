/// Typed platform adapter ports (FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC.md
/// §Platform adapters). Widgets and services depend on these interfaces;
/// concrete bindings land with the capabilities that need them. Phase 1
/// ships the clipboard + share ports used by 我的应用 sharing, backed by
///`Clipboard`/`Share`-style implementations injected at bootstrap.
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

abstract interface class SharePort {
  Future<void> share(String title, String text);
}

/// Phase 1 no-op share port (system share sheet arrives with the
/// `share_plus`-style binding in the packaging milestone).
class NoopSharePort implements SharePort {
  const NoopSharePort();

  @override
  Future<void> share(String title, String text) async {}
}

/// Registry the bootstrap binds once; screens read through the getters.
class HostAdapters {
  HostAdapters._();

  static HostAdapters? _instance;

  factory HostAdapters() => _instance ??= HostAdapters._();

  ClipboardPort clipboard = const SystemClipboardPort();
  SharePort share = const NoopSharePort();
}
