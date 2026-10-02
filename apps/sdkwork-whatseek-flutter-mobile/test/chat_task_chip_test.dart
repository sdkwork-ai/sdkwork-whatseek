// Widget test for the chat task chip (PRD §41): a reply carrying a taskId
// renders the seven-state task chip, and the mock completes the task so the
// refreshed chip reads 已完成 (H5 TaskChip / mini-program onTaskTap parity).
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_whatseek_flutter_mobile_chat/sdkwork_whatseek_flutter_mobile_chat.dart';

void main() {
  testWidgets('create_content_reply_renders_the_refreshed_task_chip',
      (tester) async {
    await tester.pumpWidget(const MaterialApp(home: ChatScreen()));

    await tester.enterText(find.byType(TextField), '帮我生成一张海报');
    await tester.testTextInput.receiveAction(TextInputAction.done);
    await tester.pumpAndSettle();

    // The reply resolves and the task chip shows the refreshed state.
    expect(find.text('收到！任务已完成。'), findsOneWidget);
    expect(find.text('已完成'), findsOneWidget);
    expect(find.text('排队中'), findsNothing);
  });
}
