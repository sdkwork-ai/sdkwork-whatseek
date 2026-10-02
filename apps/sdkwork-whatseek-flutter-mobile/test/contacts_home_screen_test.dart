// Widget tests for the 通讯录 home (PRD §26): the six kind segments and the
// submit-driven search over the unified directory (H5 ContactsHomeScreen
// parity).
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_whatseek_flutter_mobile_contacts/sdkwork_whatseek_flutter_mobile_contacts.dart';

Widget _host(Widget child) => MaterialApp(
      onGenerateRoute: (settings) => MaterialPageRoute<void>(
        settings: settings,
        builder: (_) => const Scaffold(body: Text('pushed-target')),
      ),
      home: child,
    );

void main() {
  testWidgets('renders_the_directory_with_all_six_kind_segments', (tester) async {
    await tester.pumpWidget(_host(const ContactsHomeScreen()));
    await tester.pumpAndSettle();

    for (final label in ['全部', '联系人', '群组', '企业与商家', 'Agent', 'AI 助手']) {
      expect(find.text(label), findsOneWidget);
    }
    expect(find.text('全部联系人（6）'), findsOneWidget);
    expect(find.text('张三'), findsOneWidget);
    expect(find.text('设计团队'), findsOneWidget);
    expect(find.text('问寻 AI 助手'), findsOneWidget);

    // A directory row opens the contact detail route.
    await tester.tap(find.text('张三'));
    await tester.pumpAndSettle();
    expect(find.text('pushed-target'), findsOneWidget);
  });

  testWidgets('search_submission_filters_the_directory', (tester) async {
    await tester.pumpWidget(_host(const ContactsHomeScreen()));
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextField), '张三');
    await tester.testTextInput.receiveAction(TextInputAction.done);
    await tester.pumpAndSettle();

    expect(find.text('全部联系人（1）'), findsOneWidget);
    // The row (identified by its bio — the TextField still holds the query
    // text) is the only match left.
    expect(find.text('产品经理 · 负责问寻应用中心'), findsOneWidget);
    expect(find.text('设计团队'), findsNothing);
  });

  testWidgets('kind_segment_filters_and_combines_with_search', (tester) async {
    await tester.pumpWidget(_host(const ContactsHomeScreen()));
    await tester.pumpAndSettle();

    await tester.tap(find.text('群组'));
    await tester.pumpAndSettle();
    expect(find.text('全部联系人（1）'), findsOneWidget);
    expect(find.text('设计团队'), findsOneWidget);
    expect(find.text('张三'), findsNothing);

    // Search and segment compose: 张三 matches the query but fails the
    // 群组 segment, so the empty state takes over.
    await tester.enterText(find.byType(TextField), '张三');
    await tester.testTextInput.receiveAction(TextInputAction.done);
    await tester.pumpAndSettle();
    expect(find.text('没有找到匹配的联系人'), findsOneWidget);
  });
}
