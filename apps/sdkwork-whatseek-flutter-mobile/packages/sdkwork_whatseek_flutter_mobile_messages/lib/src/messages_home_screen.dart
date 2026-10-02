import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";
import "package:sdkwork_whatseek_flutter_mobile_commons/sdkwork_whatseek_flutter_mobile_commons.dart";

import 'i18n/messages_strings.dart';

/// 消息 tab root: the unified event center.
class MessagesHomeScreen extends StatefulWidget {
  const MessagesHomeScreen({super.key});

  @override
  State<MessagesHomeScreen> createState() => _MessagesHomeScreenState();
}

class _MessagesHomeScreenState extends State<MessagesHomeScreen> {
  late Future<List<Conversation>> _conversations;

  @override
  void initState() {
    super.initState();
    _conversations = WhatseekRuntime.instance.messages.listConversations();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(WhatseekMessagesStrings.of(context, 'home.title'))),
      body: FutureBuilder<List<Conversation>>(
        future: _conversations,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const ScreenState(state: ScreenStateKind.loading);
          }
          if (snapshot.hasError) {
            return ScreenState(
              state: ScreenStateKind.error,
              onRetry: () => setState(() {
                _conversations = WhatseekRuntime.instance.messages.listConversations();
              }),
            );
          }
          final conversations = snapshot.data ?? const <Conversation>[];
          return ListView(
            children: [
              for (final conversation in conversations)
                ListTile(
                  leading: const Avatar(glyph: '💬'),
                  title: Text(_conversationTitle(context, conversation)),
                  subtitle: Text(conversation.lastMessagePreview ?? ''),
                  trailing: conversation.unread > 0
                      ? Badge(label: Text('${conversation.unread}'))
                      : null,
                  onTap: () => Navigator.of(context).pushNamed(
                    'app.whatseek.messages.conversation',
                    arguments: conversation.id,
                  ),
                ),
            ],
          );
        },
      ),
    );
  }

  /// Explicit titles are seed data; `titleKey` values are i18n keys
  /// (`whatseek.messages.kind.*`), falling back to the system-notice label.
  static String _conversationTitle(BuildContext context, Conversation conversation) {
    final title = conversation.title;
    if (title != null && title.isNotEmpty) {
      return title;
    }
    return WhatseekMessagesStrings.of(
        context, conversation.titleKey ?? 'kind.system');
  }
}
