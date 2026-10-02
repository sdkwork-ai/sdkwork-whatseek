/// IAM/session runtime for the Flutter surface. Phase 1 keeps a visitor
/// session in memory (mirrors the H5/PC auth stores); Phase 2 binds the IAM
/// login integration and clears storage, secure storage, the token manager,
/// and caches on logout/refresh-failure/tenant-switch.
library;

import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart'
    show SessionUser;

class WhatseekIamRuntime {
  WhatseekIamRuntime._();

  static final WhatseekIamRuntime instance = WhatseekIamRuntime._();

  SessionUser? _user;

  SessionUser? get user => _user;

  bool get isAuthorized => _user != null;

  /// Ensures a session exists — the standalone milestone auto-creates a
  /// visitor session so the app is immediately usable.
  SessionUser ensureSession() {
    return _user ??= const SessionUser(
      id: 'visitor',
      name: '访客',
      avatar: '🙂',
      isVisitor: true,
    );
  }

  SessionUser signIn(String name) {
    final trimmed = name.trim();
    _user = SessionUser(
      id: 'user-${DateTime.now().millisecondsSinceEpoch.toRadixString(36)}',
      name: trimmed.isEmpty ? '问寻用户' : trimmed,
      avatar: '🙂',
      isVisitor: false,
    );
    return _user!;
  }

  void signOut() {
    _user = null;
  }
}
