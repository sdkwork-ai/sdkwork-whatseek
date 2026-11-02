// Widget test: the five-tab shell renders the cross-surface tabs and the chat
// hero (chat-first entry, PRD §8).
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';
import 'package:sdkwork_whatseek_flutter_mobile_shell/sdkwork_whatseek_flutter_mobile_shell.dart';

void main() {
  testWidgets('shell_renders_five_cross_surface_tabs', (tester) async {
    const List<String> labels = <String>['对话', '应用', '通讯录', '消息', '我的'];
    await tester.pumpWidget(MaterialApp(
      home: WhatseekShell(
        destinations: [
          // Labels are literal here; the icon pairs come from the shared table
          // so the shell test cannot drift from `kTabIcons`.
          for (final (index, route) in kTabRootRoutes.indexed)
            (
              labels[index],
              kTabIcons[route.tab!]!.$1,
              kTabIcons[route.tab!]!.$2,
            ),
        ],
        currentIndex: 0,
        onDestinationSelected: (_) {},
        child: const SizedBox(),
      ),
    ));
    await tester.pump();
    for (final label in labels) {
      expect(find.text(label), findsWidgets);
    }
  });
}
