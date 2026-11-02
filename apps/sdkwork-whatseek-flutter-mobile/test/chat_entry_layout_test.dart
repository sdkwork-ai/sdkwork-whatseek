// Widget test for the chat thread layout: a user turn is a right-aligned
// bubble capped at 82% of the screen, while an assistant turn is an answer and
// spans the whole thread gutter — an AI reply must never be inset on the right
// (H5 `w-full` parity).
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_whatseek_flutter_mobile_chat/sdkwork_whatseek_flutter_mobile_chat.dart';

/// Thread content inset owned by the chat list (`ListView` padding).
const double kThreadGutter = 16;

Future<void> pumpChat(WidgetTester tester) async {
  tester.view.physicalSize = const Size(1080, 2400);
  tester.view.devicePixelRatio = 3;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);
  await tester.pumpWidget(const MaterialApp(home: ChatScreen()));
}

Future<void> sendUtterance(WidgetTester tester, String text) async {
  await tester.enterText(find.byType(TextField), text);
  await tester.testTextInput.receiveAction(TextInputAction.done);
  await tester.pumpAndSettle();
}

/// The nearest bubble surface around a thread text.
Rect bubbleAround(WidgetTester tester, Finder text) =>
    tester.getRect(find.ancestor(of: text, matching: find.byType(Container)).first);

void main() {
  testWidgets('assistant_reply_is_flush_with_the_thread_gutter_not_indented_right',
      (tester) async {
    await pumpChat(tester);
    const utterance = '帮我生成一张海报';
    await sendUtterance(tester, utterance);

    final screenWidth = tester.view.physicalSize.width / tester.view.devicePixelRatio;
    final gutterRight = screenWidth - kThreadGutter;

    final reply = find.text('收到！任务已开始，完成后我会通知你。');
    expect(reply, findsOneWidget);
    final replyBubble = bubbleAround(tester, reply);

    // Full thread width: the reply starts and ends on the same gutter as the
    // composer above it — no right indent.
    expect(replyBubble.left, moreOrLessEquals(kThreadGutter, epsilon: 0.5));
    expect(replyBubble.right, moreOrLessEquals(gutterRight, epsilon: 0.5));
  });

  testWidgets('user_turn_stays_a_right_aligned_bubble_capped_below_full_width',
      (tester) async {
    await pumpChat(tester);
    const utterance = '帮我生成一张海报';
    await sendUtterance(tester, utterance);

    final screenWidth = tester.view.physicalSize.width / tester.view.devicePixelRatio;
    final gutterRight = screenWidth - kThreadGutter;

    final userBubble = bubbleAround(tester, find.text(utterance));
    expect(userBubble.right, moreOrLessEquals(gutterRight, epsilon: 0.5));
    expect(userBubble.left, greaterThan(kThreadGutter));
    expect(userBubble.width, lessThanOrEqualTo(screenWidth * 0.82 + 0.5));
  });
}
