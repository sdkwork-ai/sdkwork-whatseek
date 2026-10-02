import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";
import "package:sdkwork_whatseek_flutter_mobile_commons/sdkwork_whatseek_flutter_mobile_commons.dart";

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
      appBar: AppBar(title: const Text('消息')),
      body: FutureBuilder<List<Conversation>>(
        future: _conversations,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const ScreenState(state: ScreenStateKind.loading);
          }
          final conversations = snapshot.data ?? const <Conversation>[];
          return ListView(
            children: [
              for (final conversation in conversations)
                ListTile(
                  leading: const Avatar(glyph: '💬'),
                  title: Text(conversation.title ?? conversation.titleKey ?? '通知'),
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
}
