// Widget test: the five-tab shell renders the cross-surface tabs and the chat
// hero (chat-first entry, PRD §8).
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_whatseek_flutter_mobile_shell/sdkwork_whatseek_flutter_mobile_shell.dart';

void main() {
  testWidgets('shell_renders_five_cross_surface_tabs', (tester) async {
    await tester.pumpWidget(MaterialApp(
      home: WhatseekShell(
        destinations: const [
          ('对话', Icons.auto_awesome),
          ('应用', Icons.grid_view),
          ('通讯录', Icons.people),
          ('消息', Icons.chat_bubble),
          ('我的', Icons.person),
        ],
        currentIndex: 0,
        onDestinationSelected: (_) {},
        child: const SizedBox(),
      ),
    ));
    await tester.pump();
    for (final label in ['对话', '应用', '通讯录', '消息', '我的']) {
      expect(find.text(label), findsWidgets);
    }
  });
}
