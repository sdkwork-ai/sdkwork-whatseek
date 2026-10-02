// Widget test for the chat task chip (PRD §41): a reply carrying a taskId
// parks at 待确认 with confirm/cancel actions, and the user's choice resolves
// the terminal state (H5 TaskChip / mini-program onTaskAction parity).
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_whatseek_flutter_mobile_chat/sdkwork_whatseek_flutter_mobile_chat.dart';

Future<void> sendContentUtterance(WidgetTester tester, String text) async {
  await tester.pumpWidget(const MaterialApp(home: ChatScreen()));
  await tester.enterText(find.byType(TextField), text);
  await tester.testTextInput.receiveAction(TextInputAction.done);
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('create_content_reply_parks_at_waiting_confirmation_with_actions',
      (tester) async {
    await sendContentUtterance(tester, '帮我生成一张海报');

    // The reply resolves and the parked task chip exposes both actions.
    expect(find.text('收到！任务已开始，完成后我会通知你。'), findsOneWidget);
    expect(find.text('待确认'), findsOneWidget);
    expect(find.text('确认完成'), findsOneWidget);
    expect(find.text('取消任务'), findsOneWidget);
  });

  testWidgets('cancel_resolves_the_parked_task_to_cancelled', (tester) async {
    await sendContentUtterance(tester, '帮我生成一张海报');

    await tester.tap(find.text('取消任务'));
    await tester.pumpAndSettle();

    expect(find.text('任务已取消。'), findsOneWidget);
    expect(find.text('已取消'), findsWidgets);
    expect(find.text('确认完成'), findsNothing);
  });

  testWidgets('confirm_completes_the_parked_task_and_lands_the_notification',
      (tester) async {
    await sendContentUtterance(tester, '帮我写一篇新年文案');

    await tester.tap(find.text('确认完成'));
    await tester.pumpAndSettle();

    expect(find.text('任务已完成，结果已同步到「消息」。'), findsOneWidget);
    expect(find.text('已完成'), findsWidgets);
    expect(find.text('取消任务'), findsNothing);
  });
}
