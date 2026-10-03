// Profile session loop (PRD P0 用户体系/基础权限): the profile tab promotes
// the visitor to a named account, the enterprise gate opens, and sign-out
// restores it — the same loop the H5/PC authState provides (REQ-2026-0005).
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_whatseek_flutter_mobile/bootstrap/iam_runtime.dart';
import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';
import 'package:sdkwork_whatseek_flutter_mobile_profile/sdkwork_whatseek_flutter_mobile_profile.dart';

Widget _bootProfile() => ProfileHomeScreen(
      readSession: () => WhatseekIamRuntime.instance.ensureSession(),
      onSignIn: () => WhatseekIamRuntime.instance.signIn('问寻用户'),
      onSignOut: () {
        WhatseekIamRuntime.instance.signOut();
        return WhatseekIamRuntime.instance.ensureSession();
      },
    );

void main() {
  tearDown(WhatseekIamRuntime.instance.signOut);

  testWidgets('profile_sign_in_promotes_the_visitor_and_opens_enterprise_apps',
      (tester) async {
    await tester.pumpWidget(MaterialApp(home: _bootProfile()));
    await tester.pumpAndSettle();

    expect(find.text('访客'), findsOneWidget);
    expect(find.text('登录'), findsOneWidget);

    await tester.tap(find.text('登录'));
    await tester.pumpAndSettle();

    expect(find.text('问寻用户'), findsOneWidget);
    expect(find.text('已登录'), findsOneWidget);
    expect(find.text('退出登录'), findsOneWidget);
    expect(WhatseekIamRuntime.instance.user!.isVisitor, isFalse);

    // The enterprise gate reads the same session the runner route injects.
    final app = await WhatseekRuntime.instance.apps
        .openApp('crm-manager', isVisitor: WhatseekIamRuntime.instance.user!.isVisitor);
    expect(app, isNotNull);
  });

  testWidgets('profile_sign_out_restores_the_visitor_gate', (tester) async {
    WhatseekIamRuntime.instance.signIn('问寻用户');
    await tester.pumpWidget(MaterialApp(home: _bootProfile()));
    await tester.pumpAndSettle();

    await tester.tap(find.text('退出登录'));
    await tester.pumpAndSettle();

    expect(find.text('访客'), findsOneWidget);
    expect(find.text('登录'), findsOneWidget);
    expect(
      WhatseekRuntime.instance.apps.openApp('crm-manager',
          isVisitor: WhatseekIamRuntime.instance.user!.isVisitor),
      throwsA(isA<WhatseekPermissionDeniedException>()),
    );
  });
}
