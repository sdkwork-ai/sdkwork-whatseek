// First-tab navbar: the 对话 home bar carries a drawer icon on the leading
// edge, the "+" quick-action menu on the trailing edge (新建会话 / 扫一扫 /
// 创建应用), and the drawer itself. Only the chat tab is touched — the other tab
// roots keep their own chrome.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_whatseek_flutter_mobile_chat/sdkwork_whatseek_flutter_mobile_chat.dart';

/// Captures what the push actually asked for.
class _RouteProbe {
  String? name;
  Object? arguments;
}

Widget _host(_RouteProbe probe) => MaterialApp(
      onGenerateRoute: (settings) {
        probe.name = settings.name;
        probe.arguments = settings.arguments;
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (_) => const Scaffold(body: Text('pushed-target')),
        );
      },
      home: const ChatScreen(),
    );

void main() {
  group('ChatScreen navbar', () {
    testWidgets('home_bar_shows_the_drawer_icon_left_and_the_plus_right',
        (tester) async {
      await tester.pumpWidget(_host(_RouteProbe()));
      await tester.pumpAndSettle();

      final appBar = find.byType(AppBar);
      expect(
        find.descendant(of: appBar, matching: find.byIcon(Icons.menu)),
        findsOneWidget,
      );
      expect(
        find.descendant(of: appBar, matching: find.byIcon(Icons.add)),
        findsOneWidget,
      );
    });

    testWidgets('plus_opens_the_scan_and_create_app_menu', (tester) async {
      await tester.pumpWidget(_host(_RouteProbe()));
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(Icons.add));
      await tester.pumpAndSettle();

      expect(find.text('扫一扫'), findsOneWidget);
      expect(find.text('创建应用'), findsOneWidget);
    });

    testWidgets('plus_menu_leads_with_new_conversation', (tester) async {
      await tester.pumpWidget(_host(_RouteProbe()));
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(Icons.add));
      await tester.pumpAndSettle();

      expect(find.text('新建会话'), findsOneWidget);
      // First row of the dropdown: new conversation sits above the other two.
      final newChatTop = tester.getTopLeft(find.text('新建会话')).dy;
      expect(newChatTop, lessThan(tester.getTopLeft(find.text('扫一扫')).dy));
      expect(newChatTop, lessThan(tester.getTopLeft(find.text('创建应用')).dy));
    });

    testWidgets('plus_new_conversation_entry_clears_the_thread', (tester) async {
      await tester.pumpWidget(_host(_RouteProbe()));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField), '你好');
      await tester.testTextInput.receiveAction(TextInputAction.done);
      await tester.pumpAndSettle();
      expect(find.text('你好'), findsOneWidget);

      await tester.tap(find.byIcon(Icons.add));
      await tester.pumpAndSettle();
      await tester.tap(find.text('新建会话'));
      await tester.pumpAndSettle();

      expect(find.text('你好'), findsNothing);
      expect(find.text('你想做什么？'), findsOneWidget);
    });

    testWidgets('create_app_entry_opens_the_app_creation_route',
        (tester) async {
      final probe = _RouteProbe();
      await tester.pumpWidget(_host(probe));
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(Icons.add));
      await tester.pumpAndSettle();
      await tester.tap(find.text('创建应用'));
      await tester.pumpAndSettle();

      expect(probe.name, 'app.whatseek.apps.create');
    });

    testWidgets('drawer_icon_opens_the_chat_drawer', (tester) async {
      await tester.pumpWidget(_host(_RouteProbe()));
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(Icons.menu));
      await tester.pumpAndSettle();

      expect(find.byType(ChatDrawer), findsOneWidget);
      expect(find.text('我的应用'), findsOneWidget);
      expect(find.text('收藏的应用'), findsOneWidget);
      expect(find.text('AI 创建应用'), findsOneWidget);
      expect(find.text('设置'), findsOneWidget);
    });

    testWidgets('drawer_favorites_entry_opens_my_apps_on_the_favorites_tab',
        (tester) async {
      final probe = _RouteProbe();
      await tester.pumpWidget(_host(probe));
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(Icons.menu));
      await tester.pumpAndSettle();
      await tester.tap(find.text('收藏的应用'));
      await tester.pumpAndSettle();

      expect(probe.name, 'app.whatseek.apps.my');
      expect(probe.arguments, 'favorites');
    });

    testWidgets('drawer_new_chat_clears_the_thread', (tester) async {
      await tester.pumpWidget(_host(_RouteProbe()));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField), '你好');
      await tester.testTextInput.receiveAction(TextInputAction.done);
      await tester.pumpAndSettle();
      expect(find.text('你好'), findsOneWidget);

      await tester.tap(find.byIcon(Icons.menu));
      await tester.pumpAndSettle();
      await tester.tap(find.text('开始新对话'));
      await tester.pumpAndSettle();

      expect(find.text('你好'), findsNothing);
      expect(find.text('你想做什么？'), findsOneWidget);
    });
  });
}
