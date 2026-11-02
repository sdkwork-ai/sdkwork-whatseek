// Widget test for the chat composer: a sent turn lands on the thread and the
// draft clears from the input box, so the next message starts empty (H5/PC
// parity).
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_whatseek_flutter_mobile_chat/sdkwork_whatseek_flutter_mobile_chat.dart';

String composerText(WidgetTester tester) =>
    tester.widget<TextField>(find.byType(TextField)).controller?.text ?? '';

void main() {
  testWidgets('sent_utterance_lands_on_the_thread_and_clears_the_composer',
      (tester) async {
    await tester.pumpWidget(const MaterialApp(home: ChatScreen()));
    await tester.enterText(find.byType(TextField), '你好');
    await tester.testTextInput.receiveAction(TextInputAction.done);
    await tester.pumpAndSettle();

    // The turn is on the thread (the hero/suggestions are gone).
    expect(find.text('你好'), findsOneWidget);
    expect(composerText(tester), isEmpty);
  });
}
